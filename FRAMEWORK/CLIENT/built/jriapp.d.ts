/// <reference path="../thirdparty/moment.d.ts" />
/// <reference path="../thirdparty/require.d.ts" />
/// <reference path="jriapp_shared.d.ts" />
declare module "jriapp/const" {
    export const TOOLTIP_SVC = "tooltipSVC";
    export const DATEPICKER_SVC = "IDatepicker";
    export const STORE_KEY: {
        SVC: string;
        CONVERTER: string;
        OBJECT: string;
    };
    export const DATA_ATTR: {
        DATA_BIND: string;
        DATA_VIEW: string;
        DATA_EVENT_SCOPE: string;
        DATA_ITEM_KEY: string;
        DATA_CONTENT: string;
        DATA_COLUMN: string;
        DATA_NAME: string;
        DATA_FORM: string;
        DATA_REQUIRE: string;
    };
    export const enum KEYS {
        backspace = 8,
        tab = 9,
        enter = 13,
        esc = 27,
        space = 32,
        pageUp = 33,
        pageDown = 34,
        end = 35,
        home = 36,
        left = 37,
        up = 38,
        right = 39,
        down = 40,
        del = 127,
    }
    export const ELVIEW_NM: {
        DataForm: string;
    };
    export const LOADER_GIF: {
        Small: string;
        Default: string;
    };
    export const enum BindTo {
        Source = 0,
        Target = 1,
    }
    export const enum BINDING_MODE {
        OneTime = 0,
        OneWay = 1,
        TwoWay = 2,
        BackWay = 3,
    }
}
declare module "jriapp/int" {
    import { BINDING_MODE, BindTo } from "jriapp/const";
    import { IBaseObject, IDisposable, IIndexer, IPromise, IVoidPromise, IValidationInfo, IErrorHandler, TEventHandler, IConfig } from "jriapp_shared";
    import { IFieldInfo } from "jriapp_shared/collection/int";
    export interface IJRIAppConfig extends IConfig {
        frameworkPath?: string;
        frameworkJS?: string;
        bust?: string;
    }
    export const Config: IJRIAppConfig;
    export class ButtonCss {
        static Edit: string;
        static Delete: string;
        static OK: string;
        static Cancel: string;
    }
    export interface ILifeTimeScope extends IBaseObject {
        addObj(b: IBaseObject): void;
        removeObj(b: IBaseObject): void;
        getObjs(): IBaseObject[];
    }
    export interface IDatepicker {
        datepickerRegion: string;
        dateFormat: string;
        attachTo(el: HTMLElement, options?: any, onSelect?: (dateText?: string) => void): void;
        detachFrom(el: HTMLElement): void;
        parseDate(str: string): Date;
        formatDate(date: Date): string;
    }
    export interface IConverter {
        convertToSource(val: any, param: any, dataContext: any): any;
        convertToTarget(val: any, param: any, dataContext: any): any;
    }
    export interface ISelectable {
        getContainerEl(): HTMLElement;
        getUniqueID(): string;
        onKeyDown(key: number, event: Event): void;
        onKeyUp(key: number, event: Event): void;
    }
    export interface ISelectableProvider {
        getISelectable(): ISelectable;
    }
    export interface IExports {
        getExports(): IIndexer<any>;
    }
    export interface ISvcStore {
        getSvc<T>(name: string): T;
        getSvc(name: string): any;
    }
    export interface ITemplateGroupInfo {
        fn_loader?: () => IPromise<string>;
        url?: string;
        names: string[];
    }
    export interface ITemplateGroupInfoEx extends ITemplateGroupInfo {
        promise?: IPromise<string>;
        app?: IApplication;
    }
    export interface ITemplateLoaderInfo {
        fn_loader: () => IPromise<string>;
        groupName?: string;
    }
    export interface IUnResolvedBindingArgs {
        bindTo: BindTo;
        root: any;
        path: string;
        propName: string;
    }
    export interface IBindableElement {
        el: HTMLElement;
        dataView: string;
        dataForm: string;
        expressions: string[];
    }
    export interface ITemplate extends IBaseObject {
        findElByDataName(name: string): HTMLElement[];
        findElViewsByDataName(name: string): IElView[];
        loadedElem: HTMLElement;
        dataContext: any;
        templateID: string;
        el: HTMLElement;
        app: IApplication;
    }
    export interface ITemplateEvents {
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
    }
    export interface IViewOptions {
        css?: string;
        tip?: string;
        el: HTMLElement;
    }
    export interface IElViewStore {
        getElView(el: HTMLElement): IElView;
        setElView(el: HTMLElement, view?: IElView): void;
        destroy(): void;
    }
    export interface IElViewRegister {
        registerElView(name: string, vwType: IViewType): void;
        getElViewType(name: string): IViewType;
        destroy(): void;
    }
    export interface IElViewFactory {
        createElView(viewInfo: {
            name: string;
            options: IViewOptions;
        }): IElView;
        getOrCreateElView(el: HTMLElement): IElView;
        getElementViewInfo(el: HTMLElement): {
            name: string;
            options: IViewOptions;
        };
        store: IElViewStore;
        register: IElViewRegister;
        destroy(): void;
    }
    export interface IViewType {
        new (options: IViewOptions): IElView;
    }
    export interface IElView extends IBaseObject {
        el: HTMLElement;
        app: IApplication;
        validationErrors: IValidationInfo[];
    }
    export interface IDataBindingService extends IDisposable {
        bindTemplateElements(templateEl: HTMLElement): IPromise<ILifeTimeScope>;
        bindElements(scope: Document | HTMLElement, defaultDataContext: any, isDataFormBind: boolean, isInsideTemplate: boolean): IPromise<ILifeTimeScope>;
        setUpBindings(): IVoidPromise;
        bind(opts: IBindingOptions): IBinding;
    }
    export interface IBindingOptions {
        mode?: BINDING_MODE;
        converterParam?: any;
        converter?: IConverter;
        targetPath: string;
        sourcePath?: string;
        target?: IBaseObject;
        source?: any;
        isSourceFixed?: boolean;
    }
    export type TBindingMode = "OneTime" | "OneWay" | "TwoWay" | "BackWay";
    export interface IBindingInfo {
        mode?: TBindingMode;
        converterParam?: any;
        converter?: any;
        targetPath: string;
        sourcePath?: string;
        to?: string;
        target?: any;
        source?: any;
    }
    export interface IBinding extends IBaseObject {
        target: IBaseObject;
        source: IBaseObject;
        targetPath: string[];
        sourcePath: string[];
        sourceValue: any;
        targetValue: any;
        mode: BINDING_MODE;
        converter: IConverter;
        converterParam: any;
        isSourceFixed: boolean;
        isDisabled: boolean;
    }
    export interface IExternallyCachable {
        addOnObjectCreated(fn: (sender: any, args: {
            objectKey: string;
            object: IBaseObject;
            isCachedExternally: boolean;
        }) => void, nmspace?: string): void;
        addOnObjectNeeded(fn: (sender: any, args: {
            objectKey: string;
            object: IBaseObject;
        }) => void, nmspace?: string): void;
    }
    export interface IContent extends IBaseObject {
        isEditing: boolean;
        dataContext: any;
        render(): void;
    }
    export interface IContentConstructor {
        new (options: IConstructorContentOptions): IContent;
    }
    export interface ITemplateInfo {
        displayID?: string;
        editID?: string;
    }
    export interface IContentOptions {
        name?: string;
        readOnly?: boolean;
        initContentFn?: (content: IExternallyCachable) => void;
        fieldInfo?: IFieldInfo;
        bindingInfo?: IBindingInfo;
        displayInfo?: {
            displayCss?: string;
            editCss?: string;
        };
        templateInfo?: ITemplateInfo;
        fieldName?: string;
        options?: any;
    }
    export interface IConstructorContentOptions {
        parentEl: HTMLElement;
        contentOptions: IContentOptions;
        dataContext: any;
        isEditing: boolean;
    }
    export interface IContentFactory {
        getContentType(options: IContentOptions): IContentConstructor;
        isExternallyCachable(contentType: IContentConstructor): boolean;
    }
    export interface IContentFactoryList extends IContentFactory {
        addFactory(factoryGetter: TFactoryGetter): void;
    }
    export type TFactoryGetter = (nextFactory?: IContentFactory) => IContentFactory;
    export interface ITooltipService {
        addToolTip(el: Element, tip: string, isError?: boolean, pos?: string): void;
    }
    export interface IStylesLoader {
        loadStyle(url: string): IPromise<any>;
        loadStyles(urls: string[]): IPromise<any>;
        loadOwnStyle(cssName?: string): IPromise<string>;
        whenAllLoaded(): IPromise<any>;
    }
    export interface IModuleLoader {
        load(names: string[]): IPromise<void>;
        whenAllLoaded(): IPromise<void>;
    }
    export interface IInternalAppMethods {
        bindTemplateElements(templateEl: HTMLElement): IPromise<ILifeTimeScope>;
        bindElements(scope: Document | HTMLElement, dctx: any, isDataFormBind: boolean, isInsideTemplate: boolean): IPromise<ILifeTimeScope>;
    }
    export interface IApplication extends IErrorHandler, IExports, IBaseObject {
        _getInternal(): IInternalAppMethods;
        addOnStartUp(fn: TEventHandler<IApplication, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnStartUp(nmspace?: string): void;
        registerElView(name: string, vwType: IViewType): void;
        registerConverter(name: string, obj: IConverter): void;
        getConverter(name: string): IConverter;
        registerSvc(name: string, obj: any): void;
        getSvc<T>(name: string): T;
        getSvc(name: string): any;
        registerObject(name: string, obj: any): void;
        getObject<T>(name: string): T;
        getObject(name: string): any;
        loadTemplates(url: string): IPromise<any>;
        loadTemplatesAsync(fnLoader: () => IPromise<string>): IPromise<any>;
        registerTemplateLoader(name: string, fnLoader: () => IPromise<string>): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(name: string, group: {
            fn_loader?: () => IPromise<string>;
            url?: string;
            names: string[];
        }): void;
        bind(opts: IBindingOptions): IBinding;
        startUp<TApp extends IApplication>(onStartUp?: (app: TApp) => any): IPromise<TApp>;
        readonly uniqueID: string;
        readonly appName: string;
        readonly appRoot: Document | HTMLElement;
        readonly viewFactory: IElViewFactory;
    }
    export interface IAppOptions {
        modulesInits?: IIndexer<(app: IApplication) => void>;
        appRoot?: Document | HTMLElement;
    }
}
declare module "jriapp/utils/parser" {
    export class Parser {
        private static _checkKeyVal(kv);
        private static _addKeyVal(kv, parts);
        private static _getKeyVals(val);
        static resolveSource(root: any, srcParts: string[]): any;
        static getBraceParts(val: string, firstOnly: boolean): string[];
        static parseOption(part: string): any;
        static parseOptions(str: string): any[];
    }
}
declare module "jriapp/elview" {
    import { IElViewFactory, IElViewRegister } from "jriapp/int";
    export function createElViewFactory(register: IElViewRegister): IElViewFactory;
    export function createElViewRegister(next?: IElViewRegister): IElViewRegister;
}
declare module "jriapp/content" {
    import { IContentFactoryList } from "jriapp/int";
    export function createContentFactoryList(): IContentFactoryList;
}
declare module "jriapp/defaults" {
    import { BaseObject } from "jriapp_shared";
    import { ButtonCss } from "jriapp/int";
    export class Defaults extends BaseObject {
        private _imagesPath;
        private _dateFormat;
        private _dateTimeFormat;
        private _timeFormat;
        private _decimalPoint;
        private _thousandSep;
        private _decPrecision;
        constructor();
        toString(): string;
        dateFormat: string;
        timeFormat: string;
        dateTimeFormat: string;
        imagesPath: string;
        decimalPoint: string;
        thousandSep: string;
        decPrecision: number;
        readonly ButtonsCSS: typeof ButtonCss;
    }
}
declare module "jriapp/utils/tloader" {
    import { IPromise, BaseObject } from "jriapp_shared";
    import { IApplication, ITemplateGroupInfoEx, ITemplateLoaderInfo } from "jriapp/int";
    export class TemplateLoader extends BaseObject {
        private _templateLoaders;
        private _templateGroups;
        private _promises;
        private _waitQueue;
        constructor();
        destroy(): void;
        protected _getEventNames(): string[];
        addOnLoaded(fn: (sender: TemplateLoader, args: {
            html: string;
            app: IApplication;
        }) => void, nmspace?: string): void;
        removeOnLoaded(nmspace?: string): void;
        waitForNotLoading(callback: (...args: any[]) => any, callbackArgs: any): void;
        private _onLoaded(html, app);
        private _getTemplateGroup(name);
        private _registerTemplateLoaderCore(name, loader);
        private _getTemplateLoaderCore(name);
        loadTemplatesAsync(fnLoader: () => IPromise<string>, app: IApplication): IPromise<any>;
        unRegisterTemplateLoader(name: string): void;
        unRegisterTemplateGroup(name: string): void;
        registerTemplateLoader(name: string, loader: ITemplateLoaderInfo): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(groupName: string, group: ITemplateGroupInfoEx): void;
        loadTemplates(url: string): void;
        readonly isLoading: boolean;
    }
}
declare module "jriapp/utils/domevents" {
    export type TEventNode = {
        fn: THandlerFunc;
        name: string;
        useCapture?: boolean;
    };
    export type TEventNodeArray = TEventNode[];
    export interface INamespaceMap {
        [ns: string]: TEventNodeArray;
    }
    export type TEventList = INamespaceMap;
    export class EventWrap {
        private _ev;
        private _target;
        constructor(ev: Event, target: TDomElement);
        readonly type: string;
        readonly target: TDomElement;
        readonly bubbles: boolean;
        readonly defaultPrevented: boolean;
        readonly cancelable: boolean;
        readonly isTrusted: boolean;
        returnValue: boolean;
        readonly srcElement: Element;
        readonly eventPhase: number;
        cancelBubble: boolean;
        readonly timeStamp: number;
        readonly currentTarget: EventTarget;
        readonly originalEvent: Event;
        readonly AT_TARGET: number;
        readonly BUBBLING_PHASE: number;
        readonly CAPTURING_PHASE: number;
        preventDefault(): void;
        stopPropagation(): void;
        stopImmediatePropagation(): void;
    }
    export type TDomElement = Element | Document | Window;
    export type TEventsArgs = {
        nmspace?: string;
        useCapture?: boolean;
    };
    export type TEventsDelegateArgs = {
        nmspace: string;
        matchElement: (el: Element) => boolean;
    };
    export type TEventsArgsOrNamespace = TEventsArgs | string;
    export type THandlerFunc = (evt: Event | EventWrap) => void;
    export class DomEvents {
        static on(el: TDomElement, evType: "MSContentZoom", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureChange", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureDoubleTap", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureEnd", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureHold", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureStart", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSGestureTap", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSInertiaStart", listener: (ev: MSGestureEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSManipulationStateChanged", listener: (ev: MSManipulationEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerCancel", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerDown", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerEnter", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerLeave", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerMove", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerOut", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerOver", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "MSPointerUp", listener: (ev: MSPointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "abort", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "activate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "beforeactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "beforedeactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "blur", listener: (ev: FocusEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "canplay", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "canplaythrough", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "change", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "click", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "contextmenu", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dblclick", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "deactivate", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "drag", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragend", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragenter", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragleave", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragover", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "dragstart", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "drop", listener: (ev: DragEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "durationchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "emptied", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "ended", listener: (ev: MediaStreamErrorEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "error", listener: (ev: ErrorEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "focus", listener: (ev: FocusEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "fullscreenchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "fullscreenerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "input", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "invalid", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "keydown", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "keypress", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "keyup", listener: (ev: KeyboardEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "load", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "loadeddata", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "loadedmetadata", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "loadstart", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mousedown", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mousemove", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mouseout", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mouseover", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mouseup", listener: (ev: MouseEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mousewheel", listener: (ev: WheelEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "mssitemodejumplistitemremoved", listener: (ev: MSSiteModeEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "msthumbnailclick", listener: (ev: MSSiteModeEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pause", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "play", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "playing", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointercancel", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerdown", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerenter", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerleave", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerlockchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerlockerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointermove", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerout", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerover", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "pointerup", listener: (ev: PointerEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "progress", listener: (ev: ProgressEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "ratechange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "readystatechange", listener: (ev: ProgressEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "reset", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "scroll", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "seeked", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "seeking", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "select", listener: (ev: UIEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "selectionchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "selectstart", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "stalled", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "stop", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "submit", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "suspend", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "timeupdate", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchcancel", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchend", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchmove", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "touchstart", listener: (ev: TouchEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "volumechange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "waiting", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "webkitfullscreenchange", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "webkitfullscreenerror", listener: (ev: Event) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: "wheel", listener: (ev: WheelEvent) => any, args?: TEventsArgsOrNamespace): void;
        static on(el: TDomElement, evType: string, listener: (ev: EventWrap) => any, args: TEventsDelegateArgs): void;
        static on(el: TDomElement, evType: string, listener: EventListenerOrEventListenerObject, args?: TEventsArgsOrNamespace): void;
        static off(el: TDomElement, evType?: string, nmspace?: string, useCapture?: boolean): void;
        static offNS(el: TDomElement, nmspace?: string): void;
    }
}
declare module "jriapp/utils/dom" {
    import { TFunc } from "jriapp_shared";
    import { DomEvents } from "jriapp/utils/domevents";
    export type TCheckDOMReady = (closure: TFunc) => void;
    export class DomUtils {
        static readonly window: Window;
        static readonly document: Document;
        static readonly ready: TCheckDOMReady;
        static readonly events: typeof DomEvents;
        static getData(el: Node, key: string): any;
        static setData(el: Node, key: string, val: any): void;
        static removeData(el: Node, key?: string): void;
        static isContained(oNode: any, oCont: any): boolean;
        static fromHTML(html: string): HTMLElement[];
        static queryAll<T>(root: Document | Element, selector: string): T[];
        static queryOne<T extends Element>(root: Document | Element, selector: string): T;
        static append(parent: Node, children: Node[]): void;
        static prepend(parent: Node, child: Node): void;
        static removeNode(node: Node): void;
        static insertAfter(node: Node, refNode: Node): void;
        static insertBefore(node: Node, refNode: Node): void;
        static wrap(elem: Element, wrapper: Element): void;
        static unwrap(elem: Element): void;
        private static getClassMap(el);
        static setClasses(elems: Element[], classes: string[]): void;
        static setClass(elems: Element[], css: string, remove?: boolean): void;
        static addClass(elems: Element[], css: string): void;
        static removeClass(elems: Element[], css: string): void;
    }
}
declare module "jriapp/utils/path" {
    export const frameworkJS: string;
    export interface IUrlParts {
        protocol: string;
        host: string;
        hostname: string;
        port: string;
        pathname: string;
        hash: string;
        search: string;
    }
    export class PathHelper {
        private static _anchor;
        static appendBust(url: string): string;
        static appendSearch(url: string, search: string): string;
        static getNormalizedUrl(url: string): string;
        static getUrlParts(url: string): IUrlParts;
        static getParentUrl(url: string): string;
        static getFrameworkPath(): string;
        static getFrameworkCssPath(): string;
        static getFrameworkImgPath(): string;
    }
}
declare module "jriapp/utils/sloader" {
    import { IStylesLoader } from "jriapp/int";
    export const frameworkCss = "jriapp.css";
    export function createCssLoader(): IStylesLoader;
    export interface IUrlParts {
        protocol: string;
        host: string;
        hostname: string;
        port: string;
        pathname: string;
        hash: string;
        search: string;
    }
}
declare module "jriapp/bootstrap" {
    import { IIndexer, IBaseObject, IPromise, TEventHandler, TPriority, BaseObject } from "jriapp_shared";
    import { IApplication, ISelectableProvider, IExports, IConverter, ISvcStore, IContentFactoryList, IElViewRegister, IStylesLoader } from "jriapp/int";
    import { Defaults } from "jriapp/defaults";
    import { TemplateLoader } from "jriapp/utils/tloader";
    export interface IInternalBootstrapMethods {
        initialize(): IPromise<Bootstrap>;
        trackSelectable(selectable: ISelectableProvider): void;
        untrackSelectable(selectable: ISelectableProvider): void;
        registerApp(app: IApplication): void;
        unregisterApp(app: IApplication): void;
        registerObject(root: IExports, name: string, obj: any): void;
        unregisterObject(root: IExports, name: string): void;
        getObject(root: IExports, name: string): any;
        getConverter(name: string): IConverter;
    }
    export const enum BootstrapState {
        None = 0,
        Initializing = 1,
        Initialized = 2,
        Ready = 3,
        Error = 4,
        Destroyed = 5,
    }
    export class Bootstrap extends BaseObject implements IExports, ISvcStore {
        static _initFramework(): void;
        private _appInst;
        private _currentSelectable;
        private _defaults;
        private _templateLoader;
        private _bootState;
        private _exports;
        private _internal;
        private _moduleInits;
        private _elViewRegister;
        private _contentFactory;
        private _objId;
        constructor();
        private _bindGlobalEvents();
        private _onTemplateLoaded(html, app);
        private _processTemplates(root, app?);
        private _processHTMLTemplates();
        private _processTemplate(name, html, app);
        protected _getEventNames(): string[];
        protected _addHandler(name: string, fn: (sender: any, args: any) => void, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
        private _init();
        private _initialize();
        private _trackSelectable(selectable);
        private _untrackSelectable(selectable);
        private _registerApp(app);
        private _unregisterApp(app);
        private _destroyApp();
        private _registerObject(root, name, obj);
        private _unregisterObject(root, name);
        private _getObject(root, name);
        private _getConverter(name);
        private _waitLoaded(onLoad);
        _getInternal(): IInternalBootstrapMethods;
        addOnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addOnUnLoad(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addOnInitialize(fn: TEventHandler<Bootstrap, any>, nmspace?: string, context?: IBaseObject): void;
        addModuleInit(fn: (app: IApplication) => void): boolean;
        getExports(): IIndexer<any>;
        getApp(): IApplication;
        init(onInit: (bootstrap: Bootstrap) => void): void;
        startApp<TApp extends IApplication>(appFactory: () => TApp, onStartUp?: (app: TApp) => void): IPromise<TApp>;
        destroy(): void;
        registerSvc(name: string, obj: any): void;
        unregisterSvc(name: string): any;
        getSvc<T>(name: string): T;
        registerConverter(name: string, obj: IConverter): void;
        registerElView(name: string, elViewType: any): void;
        getImagePath(imageName: string): string;
        loadOwnStyle(name: string): IPromise<string>;
        toString(): string;
        readonly stylesLoader: IStylesLoader;
        readonly elViewRegister: IElViewRegister;
        readonly contentFactory: IContentFactoryList;
        readonly templateLoader: TemplateLoader;
        currentSelectable: ISelectableProvider;
        readonly defaults: Defaults;
        readonly isReady: boolean;
        readonly state: BootstrapState;
    }
    export const bootstrap: Bootstrap;
}
declare module "jriapp/utils/viewchecks" {
    import { IElView } from "jriapp/int";
    export class ViewChecks {
        static isElView: (obj: any) => boolean;
        static isTemplateElView: (obj: any) => boolean;
        static setIsInsideTemplate: (elView: IElView) => void;
        static isDataForm: (el: HTMLElement) => boolean;
        static isInsideDataForm: (el: HTMLElement) => boolean;
        static isInNestedForm: (root: any, forms: HTMLElement[], el: HTMLElement) => boolean;
        static getParentDataForm: (rootForm: HTMLElement, el: HTMLElement) => HTMLElement;
    }
}
declare module "jriapp/converter" {
    import { IConverter } from "jriapp/int";
    export const NUM_CONV: {
        None: number;
        Integer: number;
        Decimal: number;
        Float: number;
        SmallInt: number;
    };
    export class BaseConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): any;
        convertToTarget(val: any, param: any, dataContext: any): any;
    }
    export let baseConverter: BaseConverter;
    export class DateConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): Date;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class DateTimeConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): Date;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class NumberConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class IntegerConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class SmallIntConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class DecimalConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class FloatConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): number;
        convertToTarget(val: any, param: any, dataContext: any): string;
        toString(): string;
    }
    export class NotConverter implements IConverter {
        convertToSource(val: any, param: any, dataContext: any): boolean;
        convertToTarget(val: any, param: any, dataContext: any): boolean;
    }
}
declare module "jriapp/binding" {
    import { IBaseObject, BaseObject } from "jriapp_shared";
    import { BINDING_MODE } from "jriapp/const";
    import { IBindingInfo, IBindingOptions, IBinding, IConverter } from "jriapp/int";
    export function getBindingOptions(bindInfo: IBindingInfo, defaultTarget: IBaseObject, defaultSource: any): IBindingOptions;
    export class Binding extends BaseObject implements IBinding {
        private _state;
        private _mode;
        private _converter;
        private _converterParam;
        private _srcPath;
        private _tgtPath;
        private _srcFixed;
        private _pathItems;
        private _objId;
        private _srcEnd;
        private _tgtEnd;
        private _source;
        private _target;
        private _umask;
        private _cntUtgt;
        private _cntUSrc;
        constructor(options: IBindingOptions);
        private _update();
        private _onSrcErrChanged(errNotif);
        private _getTgtChangedFn(self, obj, prop, restPath, lvl);
        private _getSrcChangedFn(self, obj, prop, restPath, lvl);
        private _addOnPropChanged(obj, prop, fn);
        private _parseSrc(obj, path, lvl);
        private _parseSrc2(obj, path, lvl);
        private _parseTgt(obj, path, lvl);
        private _parseTgt2(obj, path, lvl);
        private _setPathItem(newObj, bindingTo, lvl, path);
        private _cleanUp(obj);
        private _onTgtDestroyed(sender);
        private _onSrcDestroyed(sender);
        private _updateTarget();
        private _updateSource();
        protected _setTarget(value: any): void;
        protected _setSource(value: any): void;
        destroy(): void;
        toString(): string;
        readonly uniqueID: string;
        target: IBaseObject;
        source: any;
        readonly targetPath: string[];
        readonly sourcePath: string[];
        sourceValue: any;
        targetValue: any;
        readonly mode: BINDING_MODE;
        converter: IConverter;
        converterParam: any;
        readonly isSourceFixed: boolean;
        isDisabled: boolean;
    }
}
declare module "jriapp/template" {
    import { ITemplate, ITemplateEvents } from "jriapp/int";
    export const css: {
        templateContainer: string;
        templateError: string;
    };
    export interface ITemplateOptions {
        dataContext?: any;
        templEvents?: ITemplateEvents;
    }
    export function createTemplate(dataContext?: any, templEvents?: ITemplateEvents): ITemplate;
}
declare module "jriapp/utils/lifetime" {
    import { IBaseObject, BaseObject } from "jriapp_shared";
    import { ILifeTimeScope } from "jriapp/int";
    export class LifeTimeScope extends BaseObject implements ILifeTimeScope {
        private _objs;
        constructor();
        static create(): LifeTimeScope;
        addObj(b: IBaseObject): void;
        removeObj(b: IBaseObject): void;
        getObjs(): IBaseObject[];
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp/utils/propwatcher" {
    import { IBaseObject, BaseObject } from "jriapp_shared";
    export class PropWatcher extends BaseObject {
        private _objId;
        private _objs;
        constructor();
        static create(): PropWatcher;
        addPropWatch(obj: IBaseObject, prop: string, fnOnChange: (prop: string) => void): void;
        addWatch(obj: IBaseObject, props: string[], fnOnChange: (prop: string) => void): void;
        removeWatch(obj: IBaseObject): void;
        destroy(): void;
        toString(): string;
        readonly uniqueID: string;
    }
}
declare module "jriapp/mvvm" {
    import { BaseObject, IBaseObject } from "jriapp_shared";
    import { ITemplate, IApplication } from "jriapp/int";
    export interface ICommand {
        canExecute: (sender: any, param: any) => boolean;
        execute: (sender: any, param: any) => void;
        raiseCanExecuteChanged: () => void;
        addOnCanExecuteChanged(fn: (sender: ICommand, args: {}) => void, nmspace?: string, context?: IBaseObject): void;
        removeOnCanExecuteChanged(nmspace?: string): void;
    }
    export type TAction<TParam, TThis> = (sender: any, param: TParam, thisObj: TThis) => void;
    export type TPredicate<TParam, TThis> = (sender: any, param: TParam, thisObj: TThis) => boolean;
    export class TCommand<TParam, TThis> extends BaseObject implements ICommand {
        protected _action: TAction<TParam, TThis>;
        protected _thisObj: TThis;
        protected _predicate: TPredicate<TParam, TThis>;
        private _objId;
        constructor(fnAction: TAction<TParam, TThis>, thisObj?: TThis, fnCanExecute?: TPredicate<TParam, TThis>);
        protected _getEventNames(): string[];
        protected _canExecute(sender: any, param: TParam, context: any): boolean;
        protected _execute(sender: any, param: TParam, context: any): void;
        addOnCanExecuteChanged(fn: (sender: ICommand, args: any) => void, nmspace?: string, context?: IBaseObject): void;
        removeOnCanExecuteChanged(nmspace?: string): void;
        canExecute(sender: any, param: TParam): boolean;
        execute(sender: any, param: TParam): void;
        destroy(): void;
        raiseCanExecuteChanged(): void;
        toString(): string;
        readonly uniqueID: string;
        readonly thisObj: TThis;
    }
    export abstract class BaseCommand<TParam, TThis> extends TCommand<TParam, TThis> {
        constructor(thisObj: TThis);
        canExecute(sender: any, param: TParam): boolean;
        execute(sender: any, param: TParam): void;
        protected abstract Action(sender: any, param: TParam): void;
        protected abstract getIsCanExecute(sender: any, param: TParam): boolean;
    }
    export type Command = TCommand<any, any>;
    export const Command: new (fnAction: TAction<any, any>, thisObj?: any, fnCanExecute?: TPredicate<any, any>) => Command;
    export type TemplateCommand = TCommand<{
        template: ITemplate;
        isLoaded: boolean;
    }, any>;
    export const TemplateCommand: new (fnAction: TAction<{
        template: ITemplate;
        isLoaded: boolean;
    }, any>, thisObj?: any, fnCanExecute?: TPredicate<{
        template: ITemplate;
        isLoaded: boolean;
    }, any>) => TemplateCommand;
    export class ViewModel<TApp extends IApplication> extends BaseObject {
        private _objId;
        private _app;
        constructor(app: TApp);
        toString(): string;
        destroy(): void;
        readonly uniqueID: string;
        readonly app: TApp;
    }
}
declare module "jriapp/utils/mloader" {
    import { IModuleLoader } from "jriapp/int";
    export function create(): IModuleLoader;
}
declare module "jriapp/databindsvc" {
    import { IElViewFactory, IDataBindingService } from "jriapp/int";
    export function createDataBindSvc(root: Document | HTMLElement, elViewFactory: IElViewFactory): IDataBindingService;
}
declare module "jriapp/app" {
    import { IIndexer, TEventHandler, IPromise, IBaseObject, BaseObject } from "jriapp_shared";
    import { IElViewFactory, IViewType, IApplication, IBindingOptions, IAppOptions, IInternalAppMethods, IConverter, ITemplateGroupInfo, IBinding } from "jriapp/int";
    export class Application extends BaseObject implements IApplication {
        private _UC;
        private _moduleInits;
        private _objId;
        private _objMaps;
        private _appName;
        private _exports;
        protected _options: IAppOptions;
        private _dataBindingService;
        private _viewFactory;
        private _internal;
        private _appState;
        constructor(options?: IAppOptions);
        private _cleanUpObjMaps();
        private _initAppModules();
        protected _getEventNames(): string[];
        protected onStartUp(): any;
        _getInternal(): IInternalAppMethods;
        addOnStartUp(fn: TEventHandler<IApplication, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnStartUp(nmspace?: string): void;
        getExports(): IIndexer<any>;
        bind(opts: IBindingOptions): IBinding;
        registerConverter(name: string, obj: IConverter): void;
        getConverter(name: string): IConverter;
        registerSvc(name: string, obj: any): void;
        getSvc(name: string): any;
        registerElView(name: string, vwType: IViewType): void;
        registerObject(name: string, obj: any): void;
        getObject(name: string): any;
        startUp(onStartUp?: (app: Application) => any): IPromise<Application>;
        loadTemplates(url: string): IPromise<any>;
        loadTemplatesAsync(fnLoader: () => IPromise<string>): IPromise<any>;
        registerTemplateLoader(name: string, fnLoader: () => IPromise<string>): void;
        registerTemplateById(name: string, templateId: string): void;
        getTemplateLoader(name: string): () => IPromise<string>;
        registerTemplateGroup(name: string, group: ITemplateGroupInfo): void;
        destroy(): void;
        toString(): string;
        readonly uniqueID: string;
        readonly options: IAppOptions;
        readonly appName: string;
        readonly appRoot: Document | HTMLElement;
        readonly viewFactory: IElViewFactory;
        readonly UC: any;
        readonly app: this;
    }
}
declare module "jriapp" {
    export * from "jriapp_shared";
    export * from "jriapp_shared/collection/const";
    export * from "jriapp_shared/collection/int";
    export * from "jriapp_shared/utils/jsonbag";
    export { Promise } from "jriapp_shared/utils/deferred";
    export { KEYS, BINDING_MODE, BindTo } from "jriapp/const";
    export { IAppOptions, IApplication, TBindingMode, ITemplate, ITemplateEvents, IBinding, IBindingInfo, IBindingOptions, IConverter, IContentFactory, IDatepicker, IElView, ITooltipService, ISelectable, ISelectableProvider, ILifeTimeScope, ITemplateGroupInfo, ITemplateGroupInfoEx, ITemplateInfo, ITemplateLoaderInfo, IViewOptions } from "jriapp/int";
    export { DomUtils as DOM } from "jriapp/utils/dom";
    export { ViewChecks } from "jriapp/utils/viewchecks";
    export { BaseConverter } from "jriapp/converter";
    export { bootstrap } from "jriapp/bootstrap";
    export { Binding } from "jriapp/binding";
    export { createTemplate, ITemplateOptions } from "jriapp/template";
    export { LifeTimeScope } from "jriapp/utils/lifetime";
    export { PropWatcher } from "jriapp/utils/propwatcher";
    export { ViewModel, TemplateCommand, BaseCommand, Command, ICommand, TCommand } from "jriapp/mvvm";
    export { Application } from "jriapp/app";
    export const VERSION = "1.5.9";
}
