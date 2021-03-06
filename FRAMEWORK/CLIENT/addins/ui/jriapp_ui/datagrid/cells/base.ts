﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR } from "jriapp/const";
import { ICollectionItem } from "jriapp_shared/collection/int";

import { DblClick } from "../../utils/dblclick";
import { Row } from "../rows/row";
import { BaseColumn } from "../columns/base";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = DomUtils;

export interface ICellOptions {
    row: Row;
    td: HTMLTableCellElement;
    column: BaseColumn;
    num: number;
}

export class BaseCell<TColumn extends BaseColumn> extends BaseObject {
    private _row: Row;
    private _td: HTMLTableCellElement;
    private _column: TColumn;
    protected _click: DblClick;
    private _num: number;

    constructor(options: ICellOptions) {
        super();
        options = utils.core.extend(
            {
                row: null,
                td: null,
                column: null,
                num: 0
            }, options);
        this._row = options.row;
        this._td = options.td;
        this._column = <TColumn>options.column;
        this._num = options.num;
        this._td.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, this._column.uniqueID);
        dom.setData(this._td, "cell", this);
        if (!!this._column.options.rowCellCss) {
            dom.addClass([this._td], this._column.options.rowCellCss);
        }
        this._click = new DblClick();
        this._row.tr.appendChild(this._td);
    }
    protected _onCellClicked(row?: Row) {
    }
    protected _onDblClicked(row?: Row) {
        this.grid._getInternal().onCellDblClicked(this);
    }
    click() {
        this.grid.currentRow = this._row;
        this._click.click();
    }
    scrollIntoView() {
        this.row.scrollIntoView();
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        if (!!this._click) {
            this._click.destroy();
            this._click = null;
        }
        dom.removeData(this._td);
        this._row = null;
        this._td = null;
        this._column = null;
        super.destroy();
    }
    toString(): string {
        return "BaseCell";
    }
    get td(): HTMLTableCellElement { return this._td; }
    get row(): Row { return this._row; }
    get column(): TColumn { return this._column; }
    get grid(): DataGrid { return this._row.grid; }
    get item(): ICollectionItem { return this._row.item; }
    get uniqueID(): string { return this._row.uniqueID + "_" + this._num; }
    get num(): number { return this._num; }
}
