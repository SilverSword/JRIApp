﻿/// <reference path="../../built/shared/shared.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as DEMODB from "./demoDB";
import * as COMMON from "common";

var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;

export class RadioValueConverter extends RIAPP.BaseConverter {
    convertToSource(val: any, param: any, dataContext: any) {
        return !!val ? param : undefined;
    }
    convertToTarget(val: any, param: any, dataContext: any) {
        return (val == param) ? true : false;
    }
}

export class RadioDemoVM extends RIAPP.ViewModel<DemoApplication> {
    private _radioValue: string;
    private _radioValues: DEMODB.RadioValDictionary;
    private _testDict: DEMODB.TestDictionary;

    constructor(app: DemoApplication) {
        super(app);
        var self = this;
        this._radioValue = null;
        //one property in a dictionary  must be unique and used as key (its name does not matter )
        this._radioValues = new DEMODB.RadioValDictionary();
        this._radioValues.fillItems([{ key: 'radioValue1', value: 'This is some text value #1', comment: 'This is some comment for value #1' },
            { key: 'radioValue2', value: 'This is some text value #2', comment: 'This is some comment for value #2' },
            { key: 'radioValue3', value: 'This is some text value #3', comment: 'This is some comment for value #3' },
            { key: 'radioValue4', value: 'This is some text value #4', comment: 'This is some comment for value #4' }], false);
        //typed dictionary generated by DEMO data services GetTypeScript method
        this._testDict = new DEMODB.TestDictionary();
        this._testDict.fillItems([{ Key: 'one', SomeProperty1: 'some text one', SomeProperty2: [1, 2, 3], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.OK },
            { Key: 'two', SomeProperty1: 'some text two', SomeProperty2: [4, 5, 3], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.Error },
            { Key: 'thee', SomeProperty1: 'some text three', SomeProperty2: [6, 7, 8], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.OK },
            { Key: 'four', SomeProperty1: 'some text four', SomeProperty2: [2, 5, 7], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.OK }
        ], true);
        //console.log(this._testDict.items2[3].SomeProperty2[0]);
    }
    _getEventNames() {
        var base_events = super._getEventNames();
        return ['radio_value_changed'].concat(base_events);
    }
    //can be overriden in descendants as in his example
    _onRadioValueChanged() {
        this.raiseEvent('radio_value_changed', { value: this.radioValue })
    }
    get radioValue() { return this._radioValue; }
    set radioValue(v) {
        if (this._radioValue !== v) {
            this._radioValue = v;
            this.raisePropertyChanged('radioValue');
            this._onRadioValueChanged();
        }
    }
    get radioValues() { return this._radioValues; }
    get testDict() { return this._testDict; }
}

//an example of extending base class and appending extra logic
export class RadioDemo2VM extends RadioDemoVM {
    private _historyList: DEMODB.HistoryList;
    private _clearListCommand: RIAPP.ICommand;

    constructor(app: DemoApplication, currentValue?: string) {
        super(app);
        var self = this;
        if (!!currentValue)
            this.radioValue = currentValue;
        this._historyList = new DEMODB.HistoryList();
        this._historyList.addOnPropertyChange('count', function (s, a) {
            self._clearListCommand.raiseCanExecuteChanged();
        }, this.uniqueID);
        this._clearListCommand = new RIAPP.Command(function (sender, param) {
            self.clearList();
            self.radioValue = null;
        }, self, function (sender, param) {
            return self._historyList.count > 0;
        });
    }
    //override the base method
    _onRadioValueChanged() {
        super._onRadioValueChanged();
        if (!!this.radioValue) {
            var item = this._historyList.addNew();
            item.radioValue = this.radioValue;
            item.time = new Date();
            item._aspect.endEdit();
        }
    }
    clearList() {
        /*
        let t: any = null;
        t = setInterval(() => {
            if (this._historyList.currentItem)
                this._historyList.removeItem(this._historyList.currentItem);
            else
                clearTimeout(t);
        }, 1000);
        */
        this._historyList.clear();
    }
    get historyList() { return this._historyList; }
    get clearListCommand() { return this._clearListCommand; }
}

export class DemoApplication extends RIAPP.Application {
    _errorVM: COMMON.ErrorViewModel;
    _demoVM: RadioDemo2VM;

    constructor(options: RIAPP.IAppOptions) {
        super(options);
        var self = this;
        this._errorVM = null;
        this._demoVM = null;
    }
    onStartUp() {
        var self = this;
        this._errorVM = new COMMON.ErrorViewModel(this);
        this._demoVM = new RadioDemo2VM(this);

        //here we could process application's errors
        this.addOnError(function (sender, data) {
            debugger;
            data.isHandled = true;
            self.errorVM.error = data.error;
            self.errorVM.showDialog();
        });
        super.onStartUp();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        var self = this;
        try {
            self._errorVM.destroy();
            self._demoVM.destroy();
        } finally {
            super.destroy();
        }
    }
    get errorVM() { return this._errorVM; }
    get TEXT() { return RIAPP.LocaleSTRS.TEXT; }
    get demoVM() { return this._demoVM; }
}

//bootstrap error handler - the last resort (typically display message to the user)
bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
});

function initModule(app: RIAPP.Application) {
    app.registerConverter('radioValueConverter', new RadioValueConverter());
};

export var appOptions: RIAPP.IAppOptions = {
    modulesInits: {
        "COMMON": COMMON.initModule,
        "COLLDEMO": initModule
    }
};