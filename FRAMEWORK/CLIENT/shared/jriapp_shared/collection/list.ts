﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "../utils/utils";
import { ERRS } from "../lang";

import {
    COLL_CHANGE_REASON, COLL_CHANGE_TYPE, COLL_CHANGE_OPER, ITEM_STATUS
} from "./const";
import {
    ICollectionItem, IPropInfo, PROP_NAME
} from "./int";
import { CollUtils } from "./utils";
import { BaseCollection } from "./base";
import { ItemAspect } from "./aspect";
import { ValidationError } from "../errors";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, ERROR = utils.err,
    collUtils = CollUtils;

export interface IListItem extends ICollectionItem {
    readonly _aspect: ListItemAspect<IListItem, any>;
}
export interface IListItemAspectConstructor<TItem extends IListItem, TObj> {
    new (coll: BaseList<TItem, TObj>, obj?: TObj): ListItemAspect<TItem, TObj>;
}

export type TItemFactory<TItem extends IListItem, TObj> = (aspect: ListItemAspect<TItem, TObj>) => TItem;

export class ListItemAspect<TItem extends IListItem, TObj> extends ItemAspect<TItem, TObj> {
    constructor(coll: BaseList<TItem, TObj>, vals: TObj, key: string, isNew: boolean) {
        super(coll);
        if (isNew) {
            this._status = ITEM_STATUS.Added;
        }
        this._vals = <any>vals;
        const item = coll.itemFactory(this);
        this._setItem(item);
        this._setKey(key);
    }
    _setProp(name: string, val: any) {
        let error: ValidationError;
        const coll = this.collection, item = this.item, fieldInfo = this.getFieldInfo(name),
            errors = coll.errors;
        if (this._getProp(name) !== val) {
            try {
                if (fieldInfo.isReadOnly && !(this.isNew && fieldInfo.allowClientDefault)) {
                    throw new Error(ERRS.ERR_FIELD_READONLY);
                }
                coreUtils.setValue(this._vals, name, val, false);
                item.raisePropertyChanged(name);
                errors.removeError(item, name);
                const validationInfo = this._validateField(name);
                if (!!validationInfo && validationInfo.errors.length > 0) {
                    throw new ValidationError([validationInfo], this);
                }
            } catch (ex) {
                if (utils.sys.isValidationError(ex)) {
                    error = ex;
                } else {
                    error = new ValidationError([
                        { fieldName: name, errors: [ex.message] }
                    ], this);
                }
                errors.addError(item, name, error.validations[0].errors);
                throw error;
            }
        }
    }
    _getProp(name: string): any {
        return coreUtils.getValue(this._vals, name);
    }
    _resetStatus(): void {
        this._status = ITEM_STATUS.None;
    }
    toString(): string {
        if (!this.item) {
            return "ListItemAspect";
        }
        return this.item.toString() + "Aspect";
    }
    get list(): BaseList<TItem, TObj> { return <BaseList<TItem, TObj>>this.collection; }
}

export class BaseList<TItem extends IListItem, TObj> extends BaseCollection<TItem> {
    protected _itemFactory: TItemFactory<TItem, TObj>;

    constructor(props: IPropInfo[]) {
        super();
        this._initItemFactory();
        if (!!props) {
            this._updateFieldMap(props);
        }
    }
    private _updateFieldMap(props: IPropInfo[]) {
        const self = this;
        if (!checks.isArray(props) || props.length === 0) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "props", props));
        }

        self._fieldMap = {};
        self._fieldInfos = [];
        props.forEach(function (prop) {
            const fldInfo = BaseCollection.getEmptyFieldInfo(prop.name);
            fldInfo.dataType = prop.dtype;
            self._fieldMap[prop.name] = fldInfo;
            self._fieldInfos.push(fldInfo);
            collUtils.traverseField(fldInfo, (fld, fullName) => {
                fld.dependents = null;
                fld.fullName = fullName;
            });
        });
    }
    protected _initItemFactory(): void {
       // noop
    }
    protected _attach(item: TItem) {
        try {
            this.endEdit();
        } catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
        return super._attach(item);
    }
    // override
    protected _createNew(): TItem {
        return this.createItem(null);
    }
    protected createItem(obj?: TObj): TItem {
        const isNew = !obj, vals: any = isNew ? collUtils.initVals(this.getFieldInfos(), {}) : obj,
        key = this._getNewKey();
        const aspect = new ListItemAspect<TItem, TObj>(this, vals, key, isNew);
        return aspect.item;
    }
    protected _getNewKey() {
        // client side item ID
        const key = "clkey_" + this._newKey;
        this._newKey += 1;
        return key;
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        this._itemFactory = null;
        super.destroy();
    }
    fillItems(objArray: TObj[], clearAll?: boolean) {
        const self = this, newItems: TItem[] = [], positions: number[] = [], items: TItem[] = [];
        if (!objArray) {
            objArray = [];
        }
        try {
            if (!!clearAll) {
                this.clear();
            }
            objArray.forEach(function (obj) {
                const item = self.createItem(obj), oldItem = self._itemsByKey[item._key];
                if (!oldItem) {
                    self._items.push(item);
                    self._itemsByKey[item._key] = item;
                    newItems.push(item);
                    positions.push(self._items.length - 1);
                    items.push(item);
                    item._aspect._setIsAttached(true);
                } else {
                    items.push(oldItem);
                }
            });

            if (newItems.length > 0) {
                this.raisePropertyChanged(PROP_NAME.count);
            }
        } finally {
            this._onCollectionChanged({
                changeType: COLL_CHANGE_TYPE.Reset,
                reason: COLL_CHANGE_REASON.None,
                oper: COLL_CHANGE_OPER.Fill,
                items: items,
                pos: positions
            });
            this._onFillEnd({
                items: items,
                newItems: newItems,
                reason: COLL_CHANGE_REASON.None
            });
        }
        this.moveFirst();
    }
    getNewItems(): TItem[] {
        return this._items.filter(function (item) {
            return item._aspect.isNew;
        });
    }
    resetStatus(): void {
        this._items.forEach(function (item) {
            item._aspect._resetStatus();
        });
    }
    toArray(): TObj[] {
        return this.items.map((item) => {
            return <TObj>item._aspect.vals;
        });
    }
    toString(): string {
        return "BaseList";
    }
    get itemFactory(): TItemFactory<TItem, TObj> {
        return this._itemFactory;
    }
}
