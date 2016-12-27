﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils
} from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DomUtils } from "jriapp/utils/dom";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { css, PROP_NAME, IEventChangedArgs, EVENT_CHANGE_TYPE } from "./baseview";
import { ICommand } from "jriapp/mvvm";
import { CommandElView } from "./command";

const dom = DomUtils, boot = bootstrap;

export interface IAncorOptions extends IViewOptions {
    imageSrc?: string;
    glyph?: string;
}

export class AnchorElView extends CommandElView {
    private _imageSrc: string;
    private _glyph: string;
    private _image: HTMLImageElement;
    private _span: HTMLSpanElement;

    constructor(options: IAncorOptions) {
        super(options);
        const self = this;
        this._imageSrc = null;
        this._image = null;
        this._span = null;
        this._glyph = null;

        if (!!options.imageSrc)
            this.imageSrc = options.imageSrc;

        if (!!options.glyph)
            this.glyph = options.glyph;

        dom.addClass([this.el], css.commandLink);
        $(this.el).on("click." + this.uniqueID, function (e) {
            self._onClick(e);
        });
    }
    protected _onClick(e: Event) {
        if (this.stopPropagation)
            e.stopPropagation();
        if (this.preventDefault)
            e.preventDefault();
        this.invokeCommand(null, true);
    }
    protected _updateImage(src: string) {
        let el = this.el, self = this;
        if (this._imageSrc === src)
            return;
        this._imageSrc = src;

        if (!!this._image && !src) {
            dom.removeNode(this._image);
            this._image = null;
            return;
        }

        if (!!src) {
            if (!this._image) {
                el.innerHTML = "";
                this._image = new Image();
                el.appendChild(this._image);
            }

            this._image.src = src;
        }
    }
    protected _updateGlyph(glyph: string) {
        let el = this.el;

        if (this._glyph === glyph)
            return;
        let oldGlyph = this._glyph;
        this._glyph = glyph;

        if (!!oldGlyph && !glyph) {
            dom.removeNode(this._span);
            return;
        }

        if (!!glyph) {
            if (!this._span) {
                el.innerHTML = "";
                this._span = dom.document.createElement("span");
                el.appendChild(this._span);
            }
        
            if (!!oldGlyph) {
                dom.removeClass([this._span], oldGlyph);
            }
            dom.addClass([this._span], glyph);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        dom.removeClass([this.el], css.commandLink);
        this.imageSrc = null;
        this.glyph = null;
        super.destroy();
    }
    toString() {
        return "AnchorElView";
    }
    get imageSrc() { return this._imageSrc; }
    set imageSrc(v) {
        let x = this._imageSrc;
        if (x !== v) {
            this._updateImage(v);
            this.raisePropertyChanged(PROP_NAME.imageSrc);
        }
    }
    get glyph() { return this._glyph; }
    set glyph(v) {
        let x = this._glyph;
        if (x !== v) {
            this._updateGlyph(v);
            this.raisePropertyChanged(PROP_NAME.glyph);
        }
    }
    get html() {
        return this.el.innerHTML;
    }
    set html(v) {
        let x = this.el.innerHTML;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            this.el.innerHTML = v;
            this.raisePropertyChanged(PROP_NAME.html);
        }
    }
    get text() {
        return this.el.textContent;
    }
    set text(v) {
        let x = this.el.textContent;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            this.el.textContent = v;
            this.raisePropertyChanged(PROP_NAME.text);
        }
    }
    get href(): string {
        return (<HTMLAnchorElement>this.el).href;
    }
    set href(v) {
        let x = this.href;
        v = (!v) ? "" : ("" + v);
        if (x !== v) {
            (<HTMLAnchorElement>this.el).href = v;
            this.raisePropertyChanged(PROP_NAME.href);
        }
    }
}

boot.registerElView("a", AnchorElView);
boot.registerElView("abutton", AnchorElView);