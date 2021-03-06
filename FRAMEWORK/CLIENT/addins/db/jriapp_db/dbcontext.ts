﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_TYPE, COLL_CHANGE_REASON } from "jriapp_shared/collection/const";
import {
    IIndexer, IVoidPromise, AbortError, IBaseObject, TEventHandler, LocaleERRS as ERRS,
    BaseObject, Utils, WaitQueue, Lazy, IStatefulPromise, IAbortablePromise, PromiseState
} from "jriapp_shared";
import { ValueUtils } from "jriapp_shared/collection/utils";
import {
    IEntityItem, IRefreshRowInfo, IQueryResult, IQueryInfo, IAssociationInfo, IAssocConstructorOptions,
    IPermissionsInfo, IInvokeRequest, IInvokeResponse, IQueryRequest, IQueryResponse, ITrackAssoc,
    IChangeSet, IRowInfo, IQueryParamInfo
} from "./int";
import { PROP_NAME, DATA_OPER, REFRESH_MODE } from "./const";
import { TDbSet } from "./dbset";
import { DbSets } from "./dbsets";
import { Association } from "./association";
import { TDataQuery } from "./dataquery";
import {
    AccessDeniedError, ConcurrencyError, SvcValidationError,
    DataOperationError, SubmitError
} from "./error";

const utils = Utils, http = utils.http, checks = utils.check, strUtils = utils.str,
    coreUtils = utils.core, ERROR = utils.err, valUtils = ValueUtils, _async = utils.defer;

const DATA_SVC_METH = {
    Invoke: "invoke",
    Query: "query",
    Permissions: "permissions",
    Submit: "save",
    Refresh: "refresh"
};

function fn_checkError(svcError: { name: string; message?: string; }, oper: DATA_OPER) {
    if (!svcError) {
        return;
    }
    if (ERROR.checkIsDummy(svcError)) {
        return;
    }
    switch (svcError.name) {
        case "AccessDeniedException":
            throw new AccessDeniedError(ERRS.ERR_ACCESS_DENIED, oper);
        case "ConcurrencyException":
            throw new ConcurrencyError(ERRS.ERR_CONCURRENCY, oper);
        case "ValidationException":
            throw new SvcValidationError(strUtils.format(ERRS.ERR_SVC_VALIDATION,
                svcError.message), oper);
        case "DomainServiceException":
            throw new DataOperationError(strUtils.format(ERRS.ERR_SVC_ERROR,
                svcError.message), oper);
        default:
            throw new DataOperationError(strUtils.format(ERRS.ERR_UNEXPECTED_SVC_ERROR,
                svcError.message), oper);
    }
}

export interface IInternalDbxtMethods {
    onItemRefreshed(res: IRefreshRowInfo, item: IEntityItem): void;
    refreshItem(item: IEntityItem): IStatefulPromise<IEntityItem>;
    getQueryInfo(name: string): IQueryInfo;
    onDbSetHasChangesChanged(eSet: TDbSet): void;
    load(query: TDataQuery, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>>;
}

interface IRequestPromise {
    req: IAbortablePromise<any>;
    operType: DATA_OPER;
    name: string;
}

const DBCTX_EVENTS = {
    submit_err: "submit_error"
};

export class DbContext extends BaseObject {
    private _requestHeaders: IIndexer<string>;
    private _requests: IRequestPromise[];
    protected _initState: IStatefulPromise<any>;
    protected _dbSets: DbSets;
    // _svcMethods: { [methodName: string]: (args: { [paramName: string]: any; }) => IStatefulPromise<any>; };
    protected _svcMethods: any;
    // _assoc: IIndexer<() => Association>;
    protected _assoc: any;
    private _arrAssoc: Association[];
    private _queryInf: { [queryName: string]: IQueryInfo; };
    private _serviceUrl: string;
    private _isSubmiting: boolean;
    private _isHasChanges: boolean;
    private _pendingSubmit: { promise: IVoidPromise; };
    private _serverTimezone: number;
    private _waitQueue: WaitQueue;
    private _internal: IInternalDbxtMethods;

    constructor() {
        super();
        const self = this;
        this._initState = null;
        this._requestHeaders = {};
        this._requests = [];
        this._dbSets = null;
        this._svcMethods = {};
        this._assoc = {};
        this._arrAssoc = [];
        this._queryInf = {};
        this._serviceUrl = null;
        this._isSubmiting = false;
        this._isHasChanges = false;
        this._pendingSubmit = null;
        // at first init it with client side timezone
        this._serverTimezone = coreUtils.getTimeZoneOffset();
        this._waitQueue = new WaitQueue(this);
        this._internal = {
            onItemRefreshed: (res: IRefreshRowInfo, item: IEntityItem) => {
                self._onItemRefreshed(res, item);
            },
            refreshItem: (item: IEntityItem) => {
                return self._refreshItem(item);
            },
            getQueryInfo: (name: string) => {
                return self._getQueryInfo(name);
            },
            onDbSetHasChangesChanged: (eSet: TDbSet) => {
                self._onDbSetHasChangesChanged(eSet);
            },
            load: (query: TDataQuery, reason: COLL_CHANGE_REASON) => {
                return self._load(query, reason);
            }
        };
        this.addOnPropertyChange(PROP_NAME.isSubmiting, () => {
            self.raisePropertyChanged(PROP_NAME.isBusy);
        });
    }
    protected _getEventNames() {
        const baseEvents = super._getEventNames();
        return [DBCTX_EVENTS.submit_err].concat(baseEvents);
    }
    protected _initDbSets() {
        if (this.isInitialized) {
            throw new Error(ERRS.ERR_DOMAIN_CONTEXT_INITIALIZED);
        }
    }
    protected _initAssociations(associations: IAssociationInfo[]) {
        const self = this;
        associations.forEach((assoc) => {
            self._initAssociation(assoc);
        });
    }
    protected _initMethods(methods: IQueryInfo[]) {
        const self = this;
        methods.forEach((info) => {
            if (info.isQuery) {
                self._queryInf[info.methodName] = info;
            } else {
                // service method info
                self._initMethod(info);
            }
        });
    }
    protected _updatePermissions(info: IPermissionsInfo) {
        this._serverTimezone = info.serverTimezone;
        info.permissions.forEach((perms) => {
            const dbSet = this.findDbSet(perms.dbSetName);
            if (!!dbSet) {
                dbSet._getInternal().updatePermissions(perms);
            }
        });
    }
    protected _initAssociation(assoc: IAssociationInfo) {
        const self = this, options: IAssocConstructorOptions = {
            dbContext: self,
            parentName: assoc.parentDbSetName,
            childName: assoc.childDbSetName,
            onDeleteAction: assoc.onDeleteAction,
            parentKeyFields: assoc.fieldRels.map((f) => f.parentField),
            childKeyFields: assoc.fieldRels.map((f) => f.childField),
            parentToChildrenName: assoc.parentToChildrenName,
            childToParentName: assoc.childToParentName,
            name: assoc.name
        }, name = "get" + assoc.name;
        const lazy = new Lazy<Association>(() => {
            const res = new Association(options);
            self._arrAssoc.push(res);
            return res;
        });
        this._assoc[name] = () => lazy.Value;
    }
    protected _initMethod(methodInfo: IQueryInfo) {
        const self = this;
        // function expects method parameters
        this._svcMethods[methodInfo.methodName] = (args: { [paramName: string]: any; }) => {
            const deferred = _async.createDeferred<any>(), callback = (res: { result: any; error: any; }) => {
                if (!res.error) {
                    deferred.resolve(res.result);
                } else {
                    deferred.reject();
                }
            };

            try {
                const data = self._getMethodParams(methodInfo, args);
                self._invokeMethod(data, callback);
            } catch (ex) {
                if (!ERROR.checkIsDummy(ex)) {
                    self.handleError(ex, self);
                    callback({ result: null, error: ex });
                }
            }

            return deferred.promise();
        };
    }
    protected _addRequestPromise(req: IAbortablePromise<any>, operType: DATA_OPER, name?: string) {
        const self = this, item: IRequestPromise = { req: req, operType: operType, name: name },
            cnt = self._requests.length, _isBusy = cnt > 0;

        self._requests.push(item);
        req.always(() => {
            utils.arr.remove(self._requests, item);
            self.raisePropertyChanged(PROP_NAME.requestCount);
            if (self._requests.length === 0) {
                self.raisePropertyChanged(PROP_NAME.isBusy);
            }
        });
        if (cnt !== self._requests.length) {
            self.raisePropertyChanged(PROP_NAME.requestCount);
        }
        if (_isBusy !== (self._requests.length > 0)) {
            self.raisePropertyChanged(PROP_NAME.isBusy);
        }
    }
    protected _tryAbortRequest(operType: DATA_OPER, name: string) {
        const reqs = this._requests.filter((req) => { return req.operType === operType && req.name === name; });
        reqs.forEach((r) => { r.req.abort(); });
    }
    protected _getMethodParams(methodInfo: IQueryInfo, args: { [paramName: string]: any; }): IInvokeRequest {
        const self = this, methodName: string = methodInfo.methodName,
            data: IInvokeRequest = { methodName: methodName, paramInfo: { parameters: [] } },
            paramInfos = methodInfo.parameters, len = paramInfos.length;
        if (!args) {
            args = {};
        }
        for (let i = 0; i < len; i += 1) {
            const pinfo: IQueryParamInfo = paramInfos[i];
            let val = args[pinfo.name];
            if (!pinfo.isNullable && !pinfo.isArray && !(pinfo.dataType === DATA_TYPE.String || pinfo.dataType === DATA_TYPE.Binary) && checks.isNt(val)) {
                throw new Error(strUtils.format(ERRS.ERR_SVC_METH_PARAM_INVALID, pinfo.name, val, methodInfo.methodName));
            }
            if (checks.isFunc(val)) {
                throw new Error(strUtils.format(ERRS.ERR_SVC_METH_PARAM_INVALID, pinfo.name, val, methodInfo.methodName));
            }
            if (pinfo.isArray && !checks.isNt(val) && !checks.isArray(val)) {
                val = [val];
            }
            let value: string = null;
            // byte arrays are optimized for serialization
            if (pinfo.dataType === DATA_TYPE.Binary && checks.isArray(val)) {
                value = JSON.stringify(val);
            } else if (checks.isArray(val)) {
                const arr: string[] = [];
                for (let k = 0; k < val.length; k += 1) {
                    // first convert all values to string
                    arr.push(valUtils.stringifyValue(val[k], pinfo.dateConversion, pinfo.dataType, self.serverTimezone));
                }
                value = JSON.stringify(arr);
            } else {
                value = valUtils.stringifyValue(val, pinfo.dateConversion, pinfo.dataType, self.serverTimezone);
            }

            data.paramInfo.parameters.push({ name: pinfo.name, value: value });
        }

        return data;
    }
    protected _invokeMethod(data: IInvokeRequest, callback: (res: { result: any; error: any; }) => void) {
        const self = this, operType = DATA_OPER.Invoke, fnOnComplete = (res: IInvokeResponse) => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            try {
                if (!res) {
                    throw new Error(strUtils.format(ERRS.ERR_UNEXPECTED_SVC_ERROR, "operation result is empty"));
                }
                fn_checkError(res.error, operType);
                callback({ result: res.result, error: null });
            } catch (ex) {
                if (ERROR.checkIsDummy(ex)) {
                    return;
                }
                self._onDataOperError(ex, operType);
                callback({ result: null, error: ex });
            }
        };

        try {
            const postData = JSON.stringify(data), invokeUrl = this._getUrl(DATA_SVC_METH.Invoke),
                reqPromise = http.postAjax(invokeUrl, postData, self.requestHeaders);
            self._addRequestPromise(reqPromise, operType);

            reqPromise.then((res: string) => {
                return _async.parseJSON(res);
            }).then((res: IInvokeResponse) => { // success
                fnOnComplete(res);
            }, (err) => { // error
                fnOnComplete({ result: null, error: err });
            });
        } catch (ex) {
            if (ERROR.checkIsDummy(ex)) {
                ERROR.throwDummy(ex);
            }
            this._onDataOperError(ex, operType);
            callback({ result: null, error: ex });
            ERROR.throwDummy(ex);
        }
    }
    protected _loadFromCache(query: TDataQuery, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>> {
        const self = this, defer = _async.createDeferred<IQueryResult<IEntityItem>>();
        utils.queue.enque(() => {
            if (self.getIsDestroyCalled()) {
                defer.reject(new AbortError());
                return;
            }
            const dbSet = query.dbSet;
            try {
                const queryRes = dbSet._getInternal().fillFromCache({ reason: reason, query: query });
                defer.resolve(queryRes);
            } catch (ex) {
                defer.reject(ex);
            }
        });
        return defer.promise();
    }
    protected _loadSubsets(response: IQueryResponse, isClearAll: boolean) {
        const self = this, isHasSubsets = checks.isArray(response.subsets) && response.subsets.length > 0;
        if (!isHasSubsets) {
            return;
        }
        response.subsets.forEach((loadResult) => {
            const dbSet = self.getDbSet(loadResult.dbSetName);
            dbSet.fillData(loadResult, !isClearAll);
        });
    }
    protected _onLoaded(response: IQueryResponse, query: TDataQuery, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>> {
        const self = this, defer = _async.createDeferred<IQueryResult<IEntityItem>>();
        utils.queue.enque(() => {
            if (self.getIsDestroyCalled()) {
                defer.reject(new AbortError());
                return;
            }

            const operType = DATA_OPER.Query;
            try {
                if (checks.isNt(response)) {
                    throw new Error(strUtils.format(ERRS.ERR_UNEXPECTED_SVC_ERROR, "null result"));
                }
                const dbSetName = response.dbSetName, dbSet = self.getDbSet(dbSetName);
                if (checks.isNt(dbSet)) {
                    throw new Error(strUtils.format(ERRS.ERR_DBSET_NAME_INVALID, dbSetName));
                }
                fn_checkError(response.error, operType);
                const isClearAll = (!!query && query.isClearPrevData),
                    loadRes = dbSet._getInternal().fillFromService(
                    {
                        res: response,
                        reason: reason,
                        query: query,
                        onFillEnd: () => { self._loadSubsets(response, isClearAll); }
                    });
                defer.resolve(loadRes);
            } catch (ex) {
                defer.reject(ex);
            }
        });

        return defer.promise();
    }
    protected _dataSaved(changes: IChangeSet) {
        const self = this;
        try {
            try {
                fn_checkError(changes.error, DATA_OPER.Submit);
            } catch (ex) {
                const submitted: IEntityItem[] = [], notvalid: IEntityItem[] = [];
                changes.dbSets.forEach((jsDB) => {
                    const dbSet = self._dbSets.getDbSet(jsDB.dbSetName);
                    jsDB.rows.forEach((row) => {
                        const item = dbSet.getItemByKey(row.clientKey);
                        if (!item) {
                            throw new Error(strUtils.format(ERRS.ERR_KEY_IS_NOTFOUND, row.clientKey));
                        }
                        submitted.push(item);
                        if (!!row.invalid) {
                            dbSet._getInternal().setItemInvalid(row);
                            notvalid.push(item);
                        }
                    });
                });
                throw new SubmitError(ex, submitted, notvalid);
            }

            changes.dbSets.forEach((jsDB) => {
                self._dbSets.getDbSet(jsDB.dbSetName)._getInternal().commitChanges(jsDB.rows);
            });
        } catch (ex) {
            if (ERROR.checkIsDummy(ex)) {
                ERROR.throwDummy(ex);
            }
            self._onSubmitError(ex);
            ERROR.throwDummy(ex);
        }
    }
    protected _getChanges(): IChangeSet {
        const changeSet: IChangeSet = { dbSets: [], error: null, trackAssocs: [] };
        this._dbSets.arrDbSets.forEach((dbSet) => {
            dbSet.endEdit();
            const changes: IRowInfo[] = dbSet._getInternal().getChanges();
            if (changes.length === 0) {
                return;
            }
            // it is needed to apply updates in parent-child relationship order on the server
            // and provides child to parent map of the keys for the new entities
            const trackAssoc: ITrackAssoc[] = dbSet._getInternal().getTrackAssocInfo(),
                jsDB = { dbSetName: dbSet.dbSetName, rows: changes };
            changeSet.dbSets.push(jsDB);
            changeSet.trackAssocs = changeSet.trackAssocs.concat(trackAssoc);
        });
        return changeSet;
    }
    protected _getUrl(action: string): string {
        let loadUrl = this.serviceUrl;
        if (!strUtils.endsWith(loadUrl, "/")) {
            loadUrl = loadUrl + "/";
        }
        loadUrl = loadUrl + [action, ""].join("/");
        return loadUrl;
    }
    protected _onDataOperError(ex: any, oper: DATA_OPER): boolean {
        if (ERROR.checkIsDummy(ex)) {
            return true;
        }
        const err: DataOperationError = (ex instanceof DataOperationError) ? ex : new DataOperationError(ex, oper);
        return this.handleError(err, this);
    }
    protected _onSubmitError(error: any) {
        const args = { error: error, isHandled: false };
        this.raiseEvent(DBCTX_EVENTS.submit_err, args);
        if (!args.isHandled) {
            //this.rejectChanges();
            this._onDataOperError(error, DATA_OPER.Submit);
        }
    }
    protected waitForNotBusy(callback: () => void) {
        this._waitQueue.enQueue({
            prop: PROP_NAME.isBusy,
            groupName: null,
            predicate: (val: any) => {
                return !val;
            },
            action: callback,
            actionArgs: []
        });
    }
    protected waitForNotSubmiting(callback: () => void) {
        this._waitQueue.enQueue({
            prop: PROP_NAME.isSubmiting,
            predicate: (val: any) => {
                return !val;
            },
            action: callback,
            actionArgs: [],
            groupName: "submit",
            lastWins: true
        });
    }
    protected _loadInternal(context: {
        query: TDataQuery;
        reason: COLL_CHANGE_REASON;
        loadPageCount: number;
        pageIndex: number;
        isPagingEnabled: boolean;
        dbSetName: string;
        dbSet: TDbSet;
        fn_onStart: () => void;
        fn_onEnd: () => void;
        fn_onOK: (res: IQueryResult<IEntityItem>) => void;
        fn_onErr: (ex: any) => void;
    }) {
        const self = this, oldQuery = context.dbSet.query,
            loadPageCount = context.loadPageCount,
            isPagingEnabled = context.isPagingEnabled;

        let range: { start: number; end: number; cnt: number; }, pageCount = 1,
            pageIndex = context.pageIndex;

        context.fn_onStart();
        // restore pageIndex if it was changed while loading
        context.query.pageIndex = pageIndex;
        context.dbSet._getInternal().beforeLoad(context.query, oldQuery);
        // sync pageIndex
        pageIndex = context.query.pageIndex;

        if (loadPageCount > 1 && isPagingEnabled) {
            if (context.query._getInternal().isPageCached(pageIndex)) {
                const loadPromise = self._loadFromCache(context.query, context.reason);
                loadPromise.then((loadRes) => {
                    if (self.getIsDestroyCalled()) {
                        return;
                    }
                    context.fn_onOK(loadRes);
                }, (err) => {
                    if (self.getIsDestroyCalled()) {
                        return;
                    }
                    context.fn_onErr(err);
                });
                return;
            } else {
                range = context.query._getInternal().getCache().getNextRange(pageIndex);
                pageIndex = range.start;
                pageCount = range.cnt;
            }
        }

        const requestInfo: IQueryRequest = {
            dbSetName: context.dbSetName,
            pageIndex: context.query.isPagingEnabled ? pageIndex : -1,
            pageSize: context.query.pageSize,
            pageCount: pageCount,
            isIncludeTotalCount: context.query.isIncludeTotalCount,
            filterInfo: context.query.filterInfo,
            sortInfo: context.query.sortInfo,
            paramInfo: self._getMethodParams(context.query._getInternal().getQueryInfo(), context.query.params).paramInfo,
            queryName: context.query.queryName
        };

        const reqPromise = http.postAjax(self._getUrl(DATA_SVC_METH.Query), JSON.stringify(requestInfo), self.requestHeaders);
        self._addRequestPromise(reqPromise, DATA_OPER.Query, requestInfo.dbSetName);
        reqPromise.then((res: string) => {
            return _async.parseJSON(res);
        }).then((response: IQueryResponse) => {
            return self._onLoaded(response, context.query, context.reason);
        }).then((loadRes) => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            context.fn_onOK(loadRes);
        }, (err) => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            context.fn_onErr(err);
        });
    }
    protected _onItemRefreshed(res: IRefreshRowInfo, item: IEntityItem): void {
        const operType = DATA_OPER.Refresh;
        try {
            fn_checkError(res.error, operType);
            if (!res.rowInfo) {
                item._aspect.dbSet.removeItem(item);
                item.destroy();
                throw new Error(ERRS.ERR_ITEM_DELETED_BY_ANOTHER_USER);
            } else {
                item._aspect._refreshValues(res.rowInfo, REFRESH_MODE.MergeIntoCurrent);
            }
        } catch (ex) {
            if (ERROR.checkIsDummy(ex)) {
                ERROR.throwDummy(ex);
            }
            this._onDataOperError(ex, operType);
            ERROR.throwDummy(ex);
        }
    }
    protected _loadRefresh(args: {
        item: IEntityItem;
        dbSet: TDbSet;
        fn_onStart: () => void;
        fn_onEnd: () => void;
        fn_onErr: (ex: any) => void;
        fn_onOK: (res: IRefreshRowInfo) => void;
    }) {
        const self = this, operType = DATA_OPER.Refresh;
        args.fn_onStart();
        try {
            const request: IRefreshRowInfo = {
                dbSetName: args.item._aspect.dbSetName,
                rowInfo: args.item._aspect._getRowInfo(),
                error: null
            };

            args.item._aspect._checkCanRefresh();
            const url = self._getUrl(DATA_SVC_METH.Refresh),
                reqPromise = http.postAjax(url, JSON.stringify(request), self.requestHeaders);

            self._addRequestPromise(reqPromise, operType);

            reqPromise.then((res: string) => {
                return _async.parseJSON(res);
            }).then((res: IRefreshRowInfo) => { // success
                if (self.getIsDestroyCalled()) {
                    return;
                }
                args.fn_onOK(res);
            }, (err) => { // error
                if (self.getIsDestroyCalled()) {
                    return;
                }
                args.fn_onErr(err);
            });
        } catch (ex) {
            args.fn_onErr(ex);
        }
    }
    protected _refreshItem(item: IEntityItem): IStatefulPromise<IEntityItem> {
        const self = this, deferred = _async.createDeferred<IEntityItem>();
        const context = {
            item: item,
            dbSet: item._aspect.dbSet,
            fn_onStart: () => {
                context.item._aspect._setIsRefreshing(true);
                context.dbSet._setIsLoading(true);
            },
            fn_onEnd: () => {
                context.dbSet._setIsLoading(false);
                context.item._aspect._setIsRefreshing(false);
            },
            fn_onErr: (ex: any) => {
                try {
                    context.fn_onEnd();
                    self._onDataOperError(ex, DATA_OPER.Refresh);
                } finally {
                    deferred.reject();
                }
            },
            fn_onOK: (res: IRefreshRowInfo) => {
                try {
                    self._onItemRefreshed(res, item);
                    context.fn_onEnd();
                } finally {
                    deferred.resolve(item);
                }
            }
        };

        context.dbSet.waitForNotBusy(() => self._loadRefresh(context), item._key);
        return deferred.promise();
    }
    protected _getQueryInfo(name: string): IQueryInfo {
        return this._queryInf[name];
    }
    protected _onDbSetHasChangesChanged(dbSet: TDbSet): void {
        const old = this._isHasChanges;
        this._isHasChanges = false;
        if (dbSet.isHasChanges) {
            this._isHasChanges = true;
        } else {
            const len = this._dbSets.arrDbSets.length;
            for (let i = 0; i < len; i += 1) {
                const test = this._dbSets.arrDbSets[i];
                if (test.isHasChanges) {
                    this._isHasChanges = true;
                    break;
                }
            }
        }
        if (this._isHasChanges !== old) {
            this.raisePropertyChanged(PROP_NAME.isHasChanges);
        }
    }
    protected _load(query: TDataQuery, reason: COLL_CHANGE_REASON): IStatefulPromise<IQueryResult<IEntityItem>> {
        if (!query) {
            throw new Error(ERRS.ERR_DB_LOAD_NO_QUERY);
        }

        const self = this, deferred = _async.createDeferred<IQueryResult<IEntityItem>>();

        const context = {
            query: query,
            reason: reason,
            loadPageCount: query.loadPageCount,
            pageIndex: query.pageIndex,
            isPagingEnabled: query.isPagingEnabled,
            dbSetName: query.dbSetName,
            dbSet: self.getDbSet(query.dbSetName),
            fn_onStart: () => {
                context.dbSet._setIsLoading(true);
            },
            fn_onEnd: () => {
                context.dbSet._setIsLoading(false);
            },
            fn_onOK: (res: IQueryResult<IEntityItem>) => {
                try {
                    context.fn_onEnd();
                } finally {
                    deferred.resolve(res);
                }
            },
            fn_onErr: (ex: any) => {
                try {
                    context.fn_onEnd();
                    self._onDataOperError(ex, DATA_OPER.Query);
                } finally {
                    deferred.reject();
                }
            }
        };

        if (query.isClearPrevData) {
            self._tryAbortRequest(DATA_OPER.Query, context.dbSetName);
        }

        context.dbSet.waitForNotBusy(() => {
            try {
                self._loadInternal(context);
            } catch (err) {
                context.fn_onErr(err);
            }
        }, query.isClearPrevData ? context.dbSetName : null);

        return deferred.promise();
    }
    protected _submitChanges(args: {
        fn_onStart: () => void;
        fn_onEnd: () => void;
        fn_onErr: (ex: any) => void;
        fn_onOk: () => void;
    }): void {
        const self = this;
        args.fn_onStart();
        const changeSet = self._getChanges();

        if (changeSet.dbSets.length === 0) {
            args.fn_onOk();
            return;
        }

        const reqPromise = http.postAjax(self._getUrl(DATA_SVC_METH.Submit), JSON.stringify(changeSet), self.requestHeaders);
        self._addRequestPromise(reqPromise, DATA_OPER.Submit);
        reqPromise.then((res: string) => {
            return _async.parseJSON(res);
        }).then((res: IChangeSet) => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            self._dataSaved(res);
        }).then(() => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            args.fn_onOk();
        }, (er) => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            args.fn_onErr(er);
        });
    }
    _getInternal(): IInternalDbxtMethods {
        return this._internal;
    }
    initialize(options: {
        serviceUrl: string;
        permissions?: IPermissionsInfo;
    }): IVoidPromise {
        if (!!this._initState) {
            return this._initState;
        }
        const self = this, operType = DATA_OPER.Init, deferred = _async.createDeferred<any>();

        this._initState = deferred.promise();
        this._initState.then(() => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            self.raisePropertyChanged(PROP_NAME.isInitialized);
        }, (err) => {
            if (self.getIsDestroyCalled()) {
                return;
            }
            self._onDataOperError(err, operType);
        });

        const opts = coreUtils.merge(options, {
            serviceUrl: <string>null,
            permissions: <IPermissionsInfo>null
        });
        let loadUrl: string;

        try {
            if (!checks.isString(opts.serviceUrl)) {
                throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "serviceUrl", opts.serviceUrl));
            }
            this._serviceUrl = opts.serviceUrl;
            this._initDbSets();

            if (!!opts.permissions) {
                self._updatePermissions(opts.permissions);
                deferred.resolve();
                return this._initState;
            }

            // initialize by obtaining metadata from the data service by ajax call
            loadUrl = this._getUrl(DATA_SVC_METH.Permissions);
        } catch (ex) {
            return deferred.reject(ex);
        }

        const ajaxPromise = http.getAjax(loadUrl, self.requestHeaders),
            resPromise = ajaxPromise.then((permissions: string) => {
                if (self.getIsDestroyCalled()) {
                    return;
                }
                self._updatePermissions(JSON.parse(permissions));
            });

        deferred.resolve(resPromise);
        this._addRequestPromise(ajaxPromise, operType);
        return this._initState;
    }
    addOnSubmitError(fn: TEventHandler<DbContext, { error: any; isHandled: boolean; }>, nmspace?: string, context?: IBaseObject): void {
        this._addHandler(DBCTX_EVENTS.submit_err, fn, nmspace, context);
    }
    removeOnSubmitError(nmspace?: string): void {
        this._removeHandler(DBCTX_EVENTS.submit_err, nmspace);
    }
    getDbSet(name: string): TDbSet {
        return this._dbSets.getDbSet(name);
    }
    findDbSet(name: string): TDbSet {
        return this._dbSets.findDbSet(name);
    }
    getAssociation(name: string): Association {
        const name2 = "get" + name, fn = this._assoc[name2];
        if (!fn) {
            throw new Error(strUtils.format(ERRS.ERR_ASSOC_NAME_INVALID, name));
        }
        return fn();
    }
    submitChanges(): IVoidPromise {
        const self = this;

        // don't submit when another submit is already in the queue
        if (!!this._pendingSubmit) {
            return this._pendingSubmit.promise;
        }

        const deferred = _async.createDeferred<void>(), submitState = { promise: deferred.promise() };
        this._pendingSubmit = submitState;

        const context = {
            fn_onStart: () => {
                if (!self._isSubmiting) {
                    self._isSubmiting = true;
                    self.raisePropertyChanged(PROP_NAME.isSubmiting);
                }
                // allow to post new submit
                self._pendingSubmit = null;
            },
            fn_onEnd: () => {
                if (self._isSubmiting) {
                    self._isSubmiting = false;
                    self.raisePropertyChanged(PROP_NAME.isSubmiting);
                }
            },
            fn_onErr: (ex: any) => {
                try {
                    context.fn_onEnd();
                    self._onSubmitError(ex);
                } finally {
                    deferred.reject();
                }
            },
            fn_onOk: () => {
                try {
                    context.fn_onEnd();
                } finally {
                    deferred.resolve();
                }
            }
        };

        _async.getTaskQueue().enque(() => {
            self.waitForNotBusy(() => {
                try {
                    self._submitChanges(context);
                } catch (err) {
                    context.fn_onErr(err);
                }
            });
        });

        return submitState.promise;
    }
    load(query: TDataQuery): IStatefulPromise<IQueryResult<IEntityItem>> {
        return this._load(query, COLL_CHANGE_REASON.None);
    }
    acceptChanges(): void {
        this._dbSets.arrDbSets.forEach((dbSet) => {
            dbSet.acceptChanges();
        });
    }
    rejectChanges(): void {
        this._dbSets.arrDbSets.forEach((dbSet) => {
            dbSet.rejectChanges();
        });
    }
    abortRequests(reason?: string, operType?: DATA_OPER): void {
        if (checks.isNt(operType)) {
            operType = DATA_OPER.None;
        }
        const arr: IRequestPromise[] = this._requests.filter((a) => {
            return operType === DATA_OPER.None ? true : (a.operType === operType);
        });

        for (let i = 0; i < arr.length; i += 1) {
            const promise = arr[i];
            promise.req.abort(reason);
        }
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        this.abortRequests();
        this._waitQueue.destroy();
        this._waitQueue = null;
        this._arrAssoc.forEach((assoc) => {
            assoc.destroy();
        });
        this._arrAssoc = [];
        this._assoc = {};
        this._dbSets.destroy();
        this._dbSets = null;
        this._svcMethods = {};
        this._queryInf = {};
        this._serviceUrl = null;
        this._initState = null;
        this._isSubmiting = false;
        this._isHasChanges = false;
        super.destroy();
    }
    get serviceUrl() { return this._serviceUrl; }
    get isInitialized() { return !!this._initState && this._initState.state() === PromiseState.Resolved; }
    get isBusy() { return (this.requestCount > 0) || this.isSubmiting; }
    get isSubmiting() { return this._isSubmiting; }
    get serverTimezone() { return this._serverTimezone; }
    get dbSets() { return this._dbSets; }
    get serviceMethods() { return this._svcMethods; }
    get isHasChanges() { return this._isHasChanges; }
    get requestCount() { return this._requests.length; }
    get requestHeaders() { return this._requestHeaders; }
    set requestHeaders(v) { this._requestHeaders = v; }
}
