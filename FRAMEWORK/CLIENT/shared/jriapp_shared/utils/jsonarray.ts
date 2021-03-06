﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IValidationInfo, TEventHandler, IPropertyBag } from "../int";
import { BaseObject } from "../object";
import { JsonBag, IFieldValidateArgs, IBagValidateArgs } from "./jsonbag";
import { CoreUtils } from "./coreutils";
import { AnyList, IAnyValItem } from "./anylist";

const coreUtils = CoreUtils;

const BAG_EVENTS = {
    errors_changed: "errors_changed",
    validate_bag: "validate_bag",
    validate_field: "validate_field"
};

export class JsonArray extends BaseObject {
    private _owner: JsonBag;
    private _pathToArray: string;
    private _list: AnyList = null;
    private _objId: string;

    constructor(owner: JsonBag, pathToArray: string) {
        super();
        this._objId = coreUtils.getNewID("jsn");
        this._owner = owner;
        this._pathToArray = pathToArray;
        this.owner.addOnPropertyChange("val", () => {
            if (!!this._list) {
                this._list.setValues(this.getArray());
            }
        }, this._objId);
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        this._owner.removeNSHandlers(this._objId);
        this._list.destroy();
        this._list = null;
        this._owner = null;
        super.destroy();
    }
    protected _getEventNames() {
        const baseEvents = super._getEventNames();
        return [BAG_EVENTS.validate_bag, BAG_EVENTS.validate_field].concat(baseEvents);
    }
    protected updateArray(arr: any[]): void {
        coreUtils.setValue(this._owner.val, this._pathToArray, arr, false, "->");
        this._owner.updateJson();
    }
    addOnValidateBag(fn: TEventHandler<IPropertyBag, IBagValidateArgs<IPropertyBag>>, nmspace?: string, context?: any) {
        this._addHandler(BAG_EVENTS.validate_bag, fn, nmspace, context);
    }
    removeOnValidateBag(nmspace?: string) {
        this._removeHandler(BAG_EVENTS.validate_bag, nmspace);
    }
    addOnValidateField(fn: TEventHandler<IPropertyBag, IFieldValidateArgs<IPropertyBag>>, nmspace?: string, context?: any) {
        this._addHandler(BAG_EVENTS.validate_field, fn, nmspace, context);
    }
    removeOnValidateField(nmspace?: string) {
        this._removeHandler(BAG_EVENTS.validate_field, nmspace);
    }
    // error Notification Implementation
    protected _validateBag(bag: IAnyValItem): IValidationInfo[] {
        const args: IBagValidateArgs<IPropertyBag> = {
            bag: bag,
            result: []
        };
        this.raiseEvent(BAG_EVENTS.validate_bag, args);
        return (!!args.result) ? args.result : [];
    }
    protected _validateField(bag: IAnyValItem, fieldName: string): IValidationInfo {
        const args: IFieldValidateArgs<IPropertyBag> = {
            bag: bag,
            fieldName: fieldName,
            errors: []
        };
        this.raiseEvent(BAG_EVENTS.validate_field, args);
        return (!!args.errors && args.errors.length > 0) ? { fieldName: fieldName, errors: args.errors } : null;
    }
    getArray(): any[] {
        if (!this._owner) {
            return [];
        }
        const res = coreUtils.getValue(this._owner.val, this._pathToArray, "->");
        return (!res) ? [] : res;
    }
    get pathToArray(): string {
        return this._pathToArray;
    }
    get owner(): JsonBag {
        return this._owner;
    }
    get list() {
        if (!!this._owner && !this._list) {
            this._list = new AnyList((vals: any[]) => {
                this.updateArray(vals);
            });

            this._list.addOnValidateField((s, args) => {
                const validationInfo = this._validateField(args.item, args.fieldName);
                if (!!validationInfo && validationInfo.errors.length > 0) {
                    args.errors = validationInfo.errors;
                }
            }, this._objId);

            this._list.addOnValidateItem((s, args) => {
                const validationInfos = this._validateBag(args.item);
                args.result = validationInfos;
            }, this._objId);

            this._list.setValues(this.getArray());
        }
        return this._list;
    }
}
