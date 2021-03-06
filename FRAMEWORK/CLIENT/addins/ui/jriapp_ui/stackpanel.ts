﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, BaseObject, IBaseObject, LocaleERRS as ERRS, TEventHandler, Debounce } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import {DATA_ATTR, KEYS } from "jriapp/const";
import {
    ITemplate, ISelectable,  IViewOptions, ISelectableProvider
} from "jriapp/int";
import { createTemplate } from "jriapp/template";
import { BaseElView } from "./baseview";
import {
    ITEM_STATUS, COLL_CHANGE_TYPE
} from "jriapp_shared/collection/const";
import {
    ICollection, ICollectionItem, ICollChangedArgs
} from "jriapp_shared/collection/int";
import { bootstrap } from "jriapp";

const utils = Utils, dom = DomUtils, doc = dom.document, sys = utils.sys,
    strUtils = utils.str, coreUtils = utils.core, boot = bootstrap;

const css = {
    stackpanel: "ria-stackpanel",
    item: "ria-stackpanel-item",
    horizontal: "ria-horizontal-panel",
    currentItem: "ria-current-item",
    itemDeleted: "ria-item-deleted"
};

const PROP_NAME = {
    dataSource: "dataSource",
    currentItem: "currentItem",
    panel: "panel",
    panelEvents: "panelEvents"
};

const VERTICAL = "vertical", HORIZONTAL = "horizontal";

export interface IStackPanelOptions {
    templateID: string;
    orientation?: "vertical" | "horizontal";
}

interface IMappedItem { el: HTMLElement; template: ITemplate; item: ICollectionItem; }

export interface IStackPanelConstructorOptions extends IStackPanelOptions {
    el: HTMLElement;
    dataSource: ICollection<ICollectionItem>;
}


const PNL_EVENTS = {
    item_clicked: "item_clicked"
};

export class StackPanel extends BaseObject implements ISelectableProvider {
    private _el: HTMLElement;
    private _objId: string;
    private _currentItem: ICollectionItem;
    private _itemMap: { [key: string]: IMappedItem; };
    private _options: IStackPanelConstructorOptions;
    private _selectable: ISelectable;
    private _itemTag: string;
    private _isKeyNavigation: boolean;
    private _debounce: Debounce;

    constructor(options: IStackPanelConstructorOptions) {
        super();
        const self = this;
        options = <IStackPanelConstructorOptions>coreUtils.extend(
            {
                el: null,
                dataSource: null,
                templateID: null,
                orientation: VERTICAL
            }, options);

        if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
            throw new Error(ERRS.ERR_STACKPNL_DATASRC_INVALID);
        }
        if (!options.templateID) {
            throw new Error(ERRS.ERR_STACKPNL_TEMPLATE_INVALID);
        }
        this._options = options;
        this._el = options.el;
        dom.addClass([options.el], css.stackpanel);
        const eltag = options.el.tagName.toLowerCase();
        this._itemTag = (eltag === "ul" || eltag === "ol") ? "li" : "div";

        if (this.orientation === HORIZONTAL) {
            dom.addClass([options.el], css.horizontal);
        }
        this._debounce = new Debounce();
        this._objId = coreUtils.getNewID("pnl");
        this._isKeyNavigation = false;
        this._currentItem = null;
        this._itemMap = {};
        this._selectable = {
            getContainerEl: () => {
                return self._getContainerEl();
            },
            getUniqueID: () => {
                return self.uniqueID;
            },
            onKeyDown: (key: number, event: Event) => {
                self._onKeyDown(key, event);
            },
            onKeyUp: (key: number, event: Event) => {
                self._onKeyUp(key, event);
            }
        };

        dom.events.on(this._el, "click", (e) => {
            e.stopPropagation();
            boot.currentSelectable = self;
            const el = <HTMLElement>e.target, mappedItem: IMappedItem = dom.getData(el, "data");
            self._onItemClicked(mappedItem.el, mappedItem.item);
        }, {
                nmspace: this.uniqueID,
                // using delegation
                matchElement: (el) => {
                    const attr = el.getAttribute(DATA_ATTR.DATA_EVENT_SCOPE),
                        tag = el.tagName.toLowerCase();
                    return self.uniqueID === attr && tag === self._itemTag;
                }
            });

        boot._getInternal().trackSelectable(this);

        const ds = this._options.dataSource;
        this._setDataSource(ds);
    }
    protected _getEventNames() {
        const baseEvents = super._getEventNames();
        return [PNL_EVENTS.item_clicked].concat(baseEvents);
    }
    addOnItemClicked(fn: TEventHandler<StackPanel, { item: ICollectionItem; }>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(PNL_EVENTS.item_clicked, fn, nmspace, context);
    }
    removeOnItemClicked(nmspace?: string) {
        this._removeHandler(PNL_EVENTS.item_clicked, nmspace);
    }
    protected _getContainerEl() { return this.el; }
    protected _onKeyDown(key: number, event: Event) {
        const ds = this.dataSource, self = this;
        if (!ds) {
            return;
        }
        if (this.orientation === HORIZONTAL) {
            switch (key) {
                case KEYS.left:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.movePrev(true)) {
                        self.scrollToItem(ds.currentItem, true);
                    }
                    break;
                case KEYS.right:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.moveNext(true)) {
                        self.scrollToItem(ds.currentItem, false);
                    }
                    break;
            }
        } else {
            switch (key) {
                case KEYS.up:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.movePrev(true)) {
                        self.scrollToItem(ds.currentItem, true);
                    }
                    break;
                case KEYS.down:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.moveNext(true)) {
                        self.scrollToItem(ds.currentItem, false);
                    }
                    break;
            }
        }
        this._isKeyNavigation = false;
    }
    protected _onKeyUp(key: number, event: Event) {
    }
    protected _updateCurrent(item: ICollectionItem, withScroll: boolean) {
        const self = this, old = self._currentItem;
        let mappedItem: IMappedItem;
        if (old !== item) {
            this._currentItem = item;
            if (!!old) {
                mappedItem = self._itemMap[old._key];
                if (!!mappedItem) {
                    dom.removeClass([mappedItem.el], css.currentItem);
                }
            }
            if (!!item) {
                mappedItem = self._itemMap[item._key];
                if (!!mappedItem) {
                    dom.addClass([mappedItem.el], css.currentItem);
                    if (withScroll && !this._isKeyNavigation) {
                        this.scrollToCurrent(false);
                    }
                }
            }
            this.raisePropertyChanged(PROP_NAME.currentItem);
        }
    }
    protected _onDSCurrentChanged(): void {
        const ds = this.dataSource, cur = ds.currentItem;
        this._updateCurrent(cur, !!cur);
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void {
        const self = this;
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                {
                    self._refresh();
                }
                break;
            case COLL_CHANGE_TYPE.Add:
                {
                    self._appendItems(args.items);
                }
                break;
            case COLL_CHANGE_TYPE.Remove:
                args.items.forEach(function (item) {
                    self._removeItem(item);
                });
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    const mappedItem = self._itemMap[args.old_key];
                    if (!!mappedItem) {
                        delete self._itemMap[args.old_key];
                        self._itemMap[args.new_key] = mappedItem;
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
        }
    }
    protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS) {
        const newStatus = item._aspect.status, obj = this._itemMap[item._key];
        if (!obj) {
            return;
        }
        if (newStatus === ITEM_STATUS.Deleted) {
            dom.addClass([obj.el], css.itemDeleted);
        } else if (oldStatus === ITEM_STATUS.Deleted) {
            dom.removeClass([obj.el], css.itemDeleted);
        }
    }
    protected _createTemplate(item: ICollectionItem) {
        const template = createTemplate(item, null);
        template.templateID = this.templateID;
        return template;
    }
    protected _appendItems(newItems: ICollectionItem[]) {
     const self = this, docFr = doc.createDocumentFragment();
        newItems.forEach((item) => {
            // a row for item already exists?
            if (!!self._itemMap[item._key]) {
                return;
            }
            self._appendItem(docFr, item);
        });
        self.el.appendChild(docFr);
    }
    protected _appendItem(parent: Node, item: ICollectionItem) {
        const self = this, itemElem = doc.createElement(this._itemTag);
        dom.addClass([itemElem], css.item);
        itemElem.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, this.uniqueID);
        parent.appendChild(itemElem);
        const mappedItem: IMappedItem = { el: itemElem, template: null, item: item };
        dom.setData(itemElem, "data", mappedItem);
        self._itemMap[item._key] = mappedItem;
        mappedItem.template = self._createTemplate(item);
        mappedItem.el.appendChild(mappedItem.template.el);
    }
    protected _bindDS() {
        const self = this, ds = this.dataSource;
        if (!ds) {
            return;
        }
        ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
        ds.addOnCurrentChanged(self._onDSCurrentChanged, self._objId, self);
        ds.addOnStatusChanged((sender, args) => {
            self._onItemStatusChanged(args.item, args.oldStatus);
        }, self._objId);
    }
    protected _unbindDS() {
        const self = this, ds = this.dataSource;
        if (!ds) {
            return;
        }
        ds.removeNSHandlers(self._objId);
    }
    protected _onItemClicked(div: HTMLElement, item: ICollectionItem) {
        this._updateCurrent(item, false);
        this.dataSource.currentItem = item;
        this.raiseEvent(PNL_EVENTS.item_clicked, { item: item });
    }
    protected _clearContent() {
        const self = this, keys = Object.keys(self._itemMap);
        if (keys.length === 0) {
            return;
        }
        self._el.innerHTML = "";
        keys.forEach((key) => {
            self._removeItemByKey(key);
        });
    }
    protected _removeItemByKey(key: string) {
        const self = this, mappedItem = self._itemMap[key];
        if (!mappedItem) {
            return;
        }
        delete self._itemMap[key];
        mappedItem.template.destroy();
        mappedItem.template = null;
        dom.removeNode(mappedItem.el);
    }
    protected _removeItem(item: ICollectionItem) {
        this._removeItemByKey(item._key);
    }
    protected _refresh() {
        const ds = this.dataSource, self = this;
        this._clearContent();
        if (!ds) {
            return;
        }
        const docFr = doc.createDocumentFragment();
        ds.forEach((item) => {
            self._appendItem(docFr, item);
        });
        self.el.appendChild(docFr);
    }
    protected _setDataSource(v: ICollection<ICollectionItem>) {
        this._unbindDS();
        this._options.dataSource = v;
        this._debounce.enque(() => {
            const ds = this._options.dataSource;
            if (!!ds && !ds.getIsDestroyCalled()) {
                this._bindDS();
                this._refresh();
            } else {
                this._clearContent();
            }
        });
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        this._debounce.destroy();
        boot._getInternal().untrackSelectable(this);
        this._unbindDS();
        this._clearContent();
        dom.removeClass([this._el], css.stackpanel);
        if (this.orientation === HORIZONTAL) {
            dom.removeClass([this.el], css.horizontal);
        }
        dom.events.offNS(this._el, this.uniqueID);
        this._currentItem = null;
        this._itemMap = {};
        this._options = <any>{};
        super.destroy();
    }
    getISelectable(): ISelectable {
        return this._selectable;
    }
    scrollToItem(item: ICollectionItem, isUp?: boolean) {
        if (!item) {
            return;
        }
        const mappedItem = this._itemMap[item._key];
        if (!mappedItem) {
            return;
        }
        // mappedItem.el.scrollIntoView(false);

        const isVert = this.orientation === VERTICAL, pnl = mappedItem.el, viewport = this._el,
            viewportRect = viewport.getBoundingClientRect(),  pnlRect = pnl.getBoundingClientRect(),
            viewPortSize = isVert ? viewport.clientHeight : viewport.clientWidth,
            itemSize = isVert ? pnl.offsetHeight : pnl.offsetWidth,
            currentPos = isVert ? viewport.scrollTop : viewport.scrollLeft,
            offsetDiff = isVert ? (currentPos + pnlRect.top - viewportRect.top) : (currentPos + pnlRect.left - viewportRect.left);

        const contentSize = Math.min(itemSize, viewPortSize);
        const offset = viewPortSize - contentSize;
        let pos = !isUp ? Math.floor(offsetDiff - offset + 1) : Math.floor(offsetDiff - 1);

        // console.log(strUtils.format("pos: {0} currentPos: {1} offsetDiff: {2} (offsetDiff - offset): {3} offset: {4} viewPortSize: {5} contentSize:{6} isUp: {7}",
            // pos, currentPos, offsetDiff, (offsetDiff - offset), offset, viewPortSize, contentSize, isUp));

        if (pos < 0) {
            pos = 0;
        }

        if ((currentPos < offsetDiff && currentPos > (offsetDiff - offset))) {
            return;
        }

        if (isVert) {
            this._el.scrollTop = pos;
        } else {
            this._el.scrollLeft = pos;
        }
    }
    scrollToCurrent(isUp?: boolean) {
        this.scrollToItem(this._currentItem, isUp);
    }
    focus() {
        this.scrollToCurrent(true);
        boot.currentSelectable = this;
    }
    getDivElementByItem(item: ICollectionItem) {
        const mappedItem = this._itemMap[item._key];
        return (!mappedItem) ? null : mappedItem.el;
    }
    toString() {
        return "StackPanel";
    }
    get el() { return this._options.el; }
    get uniqueID() { return this._objId; }
    get orientation() { return this._options.orientation; }
    get templateID() { return this._options.templateID; }
    get dataSource() { return this._options.dataSource; }
    set dataSource(v) {
        if (v !== this.dataSource) {
            this._setDataSource(v);
            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get currentItem() { return this._currentItem; }
}

export interface IStackPanelViewOptions extends IStackPanelOptions, IViewOptions {
}

export interface IPanelEvents {
    onItemClicked(item: ICollectionItem): void;
}

export class StackPanelElView extends BaseElView {
    private _panel: StackPanel;
    private _panelEvents: IPanelEvents;

    constructor(options: IStackPanelViewOptions) {
        super(options);
        const self = this;
        this._panelEvents = null;
        this._panel = new StackPanel(<IStackPanelConstructorOptions>options);
        this._panel.addOnItemClicked((sender, args) => {
            if (!!self._panelEvents) {
                self._panelEvents.onItemClicked(args.item);
            }
        }, this.uniqueID);
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        if (!this._panel.getIsDestroyCalled()) {
            this._panel.destroy();
        }
        this._panelEvents = null;
        super.destroy();
    }
    toString() {
        return "StackPanelElView";
    }
    get dataSource(): ICollection<ICollectionItem> {
        return this._panel.dataSource;
    }
    set dataSource(v: ICollection<ICollectionItem>) {
        if (this.dataSource !== v) {
            this._panel.dataSource = v;
            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get panelEvents() { return this._panelEvents; }
    set panelEvents(v) {
        const old = this._panelEvents;
        if (v !== old) {
            this._panelEvents = v;
            this.raisePropertyChanged(PROP_NAME.panelEvents);
        }
    }
    get panel() { return this._panel; }
}

boot.registerElView("stackpanel", StackPanelElView);
boot.registerElView("ul", StackPanelElView);
boot.registerElView("ol", StackPanelElView);
