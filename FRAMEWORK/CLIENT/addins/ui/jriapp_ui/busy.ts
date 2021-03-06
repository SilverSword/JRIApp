﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { $ } from "./utils/jquery";
import { LOADER_GIF } from "jriapp/const";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { DomUtils } from "jriapp/utils/dom";


import { BaseElView, PROP_NAME } from "./baseview";

const checks = Utils.check, boot = bootstrap, dom = DomUtils;

export interface IBusyViewOptions extends IViewOptions {
    img?: string;
    delay?: number | string;
}

export class BusyElView extends BaseElView {
    private _delay: number;
    private _timeOut: number;
    private _loaderPath: string;
    private _img: HTMLImageElement;
    private _isBusy: boolean;

    constructor(options: IBusyViewOptions) {
        super(options);
        let img: string;
        if (!!options.img) {
            img = options.img;
        } else {
            img = LOADER_GIF.Default;
        }
        this._delay = 400;
        this._timeOut = null;
        if (!checks.isNt(options.delay)) {
            this._delay = parseInt("" + options.delay);
        }
        this._loaderPath = bootstrap.getImagePath(img);
        this._img = new Image();
        this._img.style.position = "absolute";
        this._img.style.display = "none";
        this._img.style.zIndex = "10000";
        this._img.src = this._loaderPath;
        this.el.appendChild(this._img);
        this._isBusy = false;
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
        this._isDestroyCalled = true;
        if (!!this._timeOut) {
            clearTimeout(this._timeOut);
            this._timeOut = null;
        }
        dom.removeNode(this._img);
        this._img = null;
        super.destroy();
    }
    toString() {
        return "BusyElView";
    }
    get isBusy() { return this._isBusy; }
    set isBusy(v) {
        const self = this, fn = () => {
            self._timeOut = null;
            self._img.style.display = "";
            $(self._img).position({
                // "my": "right top",
                // "at": "left bottom",
                "of": $(self.el)
            });
        };

        if (v !== self._isBusy) {
            self._isBusy = v;
            if (self._isBusy) {
                if (!!self._timeOut) {
                    clearTimeout(self._timeOut);
                    self._timeOut = null;
                }

                self._timeOut = setTimeout(fn, self._delay);
            } else {
                if (!!self._timeOut) {
                    clearTimeout(self._timeOut);
                    self._timeOut = null;
                } else {
                    self._img.style.display = "none";
                }
            }
            self.raisePropertyChanged(PROP_NAME.isBusy);
        }
    }
    get delay() { return this._delay; }
    set delay(v) {
        if (v !== this._delay) {
            this._delay = v;
            this.raisePropertyChanged(PROP_NAME.delay);
        }
    }
}

boot.registerElView("busy", BusyElView);
boot.registerElView("busy_indicator", BusyElView);
