﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, Utils, IIndexer, LocaleERRS, createWeakMap, IWeakMap
} from "jriapp_shared";
import { DATA_ATTR } from "./const";
import {
    IElViewStore, IElView, IViewType, IExports, IViewOptions,
    IElViewFactory, IElViewRegister
} from "./int";
import { bootstrap } from "./bootstrap";
import { Parser } from "./utils/parser";

const utils = Utils, parser = Parser, ERRS = LocaleERRS;

export function createElViewFactory(register: IElViewRegister): IElViewFactory {
    return new ElViewFactory(register);
}

export function createElViewRegister(next?: IElViewRegister): IElViewRegister {
    return new ElViewRegister(next);
}

class ElViewRegister implements IElViewRegister, IExports {
    private _exports: IIndexer<any>;
    private _next: IElViewRegister;

    constructor(next?: IElViewRegister) {
        this._exports = {};
        this._next = next;
    }
    registerElView(name: string, vwType: IViewType): void {
        if (!bootstrap._getInternal().getObject(this, name)) {
            bootstrap._getInternal().registerObject(this, name, vwType);
        } else {
            throw new Error(utils.str.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
        }
    }
    getElViewType(name: string): IViewType {
        let res = bootstrap._getInternal().getObject(this, name);
        if (!res && !!this._next) {
            res = this._next.getElViewType(name);
        }
        return res;
    }
    destroy(): void {
        this._exports = {};
    }
    getExports(): IIndexer<any> {
        return this._exports;
    }
}

class ElViewStore implements IElViewStore {
    private _weakmap: IWeakMap;

    constructor() {
        this._weakmap = createWeakMap();
    }

    public destroy(): void {
    }
    // get element view associated with HTML element(if any)
    getElView(el: HTMLElement): IElView {
        return this._weakmap.get(el);
    }
    // store association of HTML element with its element View
    setElView(el: HTMLElement, view?: IElView): void {
        if (!view) {
            this._weakmap.delete(el);
        } else {
            this._weakmap.set(el, view);
        }
    }
}

class ElViewFactory extends BaseObject implements IElViewFactory {
    private _store: IElViewStore;
    private _register: IElViewRegister;

    constructor(register: IElViewRegister) {
        super();
        this._store = new ElViewStore();
        this._register = createElViewRegister(register);
    }
    public destroy(): void {
        if (!this._store) {
            return;
        }
        this._store.destroy();
        this._register.destroy();
        this._store = null;
        this._register = null;
        super.destroy();
    }
    createElView(viewInfo: {
        name: string;
        options: IViewOptions;
    }): IElView {
        let viewType: IViewType, elView: IElView;
        const options = viewInfo.options, el = options.el;

        if (!!viewInfo.name) {
            viewType = this._register.getElViewType(viewInfo.name);
            if (!viewType) {
                throw new Error(utils.str.format(ERRS.ERR_ELVIEW_NOT_REGISTERED, viewInfo.name));
            }
        }
        if (!viewType) {
            let nodeNm = el.nodeName.toLowerCase(), attrType: string;
            switch (nodeNm) {
                case "input":
                    {
                        attrType = el.getAttribute("type");
                        nodeNm = nodeNm + ":" + attrType;
                        viewType = this._register.getElViewType(nodeNm);
                    }
                    break;
                default:
                    viewType = this._register.getElViewType(nodeNm);
                    break;
            }

            if (!viewType) {
                throw new Error(utils.str.format(ERRS.ERR_ELVIEW_NOT_CREATED, nodeNm));
            }
        }

        try {
            elView = new viewType(options);
        } catch (e) {
            // ensure clean up
            this._store.setElView(el, null);
            throw e;
        }
        return elView;
    }
    // checks if the element already has created and attached an ElView, if no then it creates and attaches ElView for the element
    getOrCreateElView(el: HTMLElement): IElView {
        const elView = this.store.getElView(el);
        // check if element view is already created for this element
        if (!!elView) {
            return elView;
        }
        const info = this.getElementViewInfo(el);
        return this.createElView(info);
    }
    getElementViewInfo(el: HTMLElement): { name: string; options: IViewOptions; } {
        let viewName: string = null, vwOptions: IViewOptions = null, attr: string, dataViewOpArr: any[],
            dataViewOp: any;
        if (el.hasAttribute(DATA_ATTR.DATA_VIEW)) {
            attr = el.getAttribute(DATA_ATTR.DATA_VIEW);
            dataViewOpArr = parser.parseOptions(attr);
            if (!!dataViewOpArr && dataViewOpArr.length > 0) {
                dataViewOp = dataViewOpArr[0];
                if (!!dataViewOp.name && dataViewOp.name !== "default") {
                    viewName = dataViewOp.name;
                }
                vwOptions = dataViewOp.options;
            }
        }
        const options: IViewOptions = utils.core.merge({ el: el }, vwOptions);
        return { name: viewName, options: options };
    }
    get store() {
        return this._store;
    }
    get register() {
        return this._register;
    }
}
