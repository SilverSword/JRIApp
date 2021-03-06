﻿/// <reference path="../thirdparty/moment.d.ts" />
/// <reference path="../thirdparty/require.d.ts" />
/// <reference path="../built/jriapp_shared.d.ts" />

/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Bootstrap } from "./jriapp/bootstrap";

export * from "jriapp_shared";
export * from "jriapp_shared/collection/const";
export * from "jriapp_shared/collection/int";
export * from "jriapp_shared/utils/jsonbag";
export { Promise } from "jriapp_shared/utils/deferred";
export { KEYS, BINDING_MODE, BindTo } from "./jriapp/const";
export {
    IAppOptions, IApplication, TBindingMode, ITemplate, ITemplateEvents, IBinding, IBindingInfo,
    IBindingOptions, IConverter, IContentFactory, IDatepicker, IElView,
    ITooltipService, ISelectable, ISelectableProvider,
    ILifeTimeScope, ITemplateGroupInfo, ITemplateGroupInfoEx, ITemplateInfo, ITemplateLoaderInfo,
    IViewOptions
} from "./jriapp/int";
export { DomUtils as DOM } from "./jriapp/utils/dom";
export { ViewChecks } from "./jriapp/utils/viewchecks";
export { BaseConverter } from "./jriapp/converter";
export { bootstrap } from "./jriapp/bootstrap";
export { Binding } from "./jriapp/binding";
export { createTemplate, ITemplateOptions } from "./jriapp/template";
export { LifeTimeScope } from "./jriapp/utils/lifetime";
export { PropWatcher } from "./jriapp/utils/propwatcher";
export {
    ViewModel, TemplateCommand,
    BaseCommand, Command, ICommand, TCommand
} from "./jriapp/mvvm";

export { Application } from "./jriapp/app";

export const VERSION = "1.5.9";

Bootstrap._initFramework();
