var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "jriapp", "./demoDB", "common"], function (require, exports, RIAPP, DEMODB, COMMON) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var bootstrap = RIAPP.bootstrap;
    var CustomerBag = (function (_super) {
        __extends(CustomerBag, _super);
        function CustomerBag(item) {
            var _this = _super.call(this, item.Data, function (data) {
                var dbSet = item._aspect.dbSet, saveIsEditing = item._aspect.isEditing;
                if (item.Data !== data) {
                    if (!saveIsEditing) {
                        dbSet.isUpdating = true;
                        item._aspect.beginEdit();
                    }
                    item.Data = data;
                    if (!saveIsEditing) {
                        item._aspect.endEdit();
                        dbSet.isUpdating = false;
                    }
                }
            }) || this;
            _this._addresses = null;
            item.addOnPropertyChange("Data", function (s, a) {
                _this.resetJson(item.Data);
            }, null, null, 1);
            _this.initCustomerValidations();
            return _this;
        }
        CustomerBag.prototype.initCustomerValidations = function () {
            var validations = [{
                    fieldName: null, fn: function (bag, errors) {
                        if (!bag.getProp("[Level1->Level2->Phone]") && !bag.getProp("[Level1->Level2->EmailAddress]")) {
                            errors.push('at least Phone or Email address must be filled');
                        }
                    }
                },
                {
                    fieldName: "[Title]", fn: function (bag, errors) {
                        if (!bag.getProp("[Title]")) {
                            errors.push('Title must be filled');
                        }
                    }
                },
                {
                    fieldName: "[Level1->FirstName]", fn: function (bag, errors) {
                        if (!bag.getProp("[Level1->FirstName]")) {
                            errors.push('First name must be filled');
                        }
                    }
                },
                {
                    fieldName: "[Level1->LastName]", fn: function (bag, errors) {
                        if (!bag.getProp("[Level1->LastName]")) {
                            errors.push('Last name must be filled');
                        }
                    }
                }];
            this.addOnValidateBag(function (s, args) {
                var bag = args.bag;
                validations.forEach(function (val) {
                    var errors = [];
                    val.fn(bag, errors);
                    if (errors.length > 0)
                        args.result.push({ fieldName: val.fieldName, errors: errors });
                });
            });
            this.addOnValidateField(function (s, args) {
                var bag = args.bag;
                validations.filter(function (val) {
                    return args.fieldName === val.fieldName;
                }).forEach(function (val) {
                    val.fn(bag, args.errors);
                });
            });
        };
        CustomerBag.prototype.initAddressValidations = function (addresses) {
            var validations = [{
                    fieldName: "[City]", fn: function (bag, errors) {
                        if (!bag.getProp("[City]")) {
                            errors.push('City must be filled');
                        }
                    }
                },
                {
                    fieldName: "[Line1]", fn: function (bag, errors) {
                        if (!bag.getProp("[Line1]")) {
                            errors.push('Line1 name must be filled');
                        }
                    }
                }];
            addresses.addOnValidateBag(function (s, args) {
                var bag = args.bag;
                validations.forEach(function (val) {
                    var errors = [];
                    val.fn(bag, errors);
                    if (errors.length > 0)
                        args.result.push({ fieldName: val.fieldName, errors: errors });
                });
            });
            addresses.addOnValidateField(function (s, args) {
                var bag = args.bag;
                validations.filter(function (val) {
                    return args.fieldName === val.fieldName;
                }).forEach(function (val) {
                    val.fn(bag, args.errors);
                });
            });
        };
        CustomerBag.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._addresses) {
                this._addresses.destroy();
            }
            this._addresses = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(CustomerBag.prototype, "Addresses", {
            get: function () {
                if (this._isDestroyCalled)
                    return void 0;
                if (!this._addresses) {
                    this._addresses = new RIAPP.JsonArray(this, "Addresses");
                    this.initAddressValidations(this._addresses);
                }
                return this._addresses.list;
            },
            enumerable: true,
            configurable: true
        });
        return CustomerBag;
    }(RIAPP.JsonBag));
    exports.CustomerBag = CustomerBag;
    var CustomerViewModel = (function (_super) {
        __extends(CustomerViewModel, _super);
        function CustomerViewModel(app) {
            var _this = _super.call(this, app) || this;
            var self = _this;
            _this._dbSet = _this.dbSets.CustomerJSON;
            _this._propWatcher = new RIAPP.PropWatcher();
            _this._dbSet.addOnPropertyChange('currentItem', function (sender, data) {
                self._onCurrentChanged();
            }, self.uniqueID);
            _this._dbSet.addOnItemDeleting(function (sender, args) {
                if (!confirm('Are you sure that you want to delete ' + args.item.CustomerID + ' ?'))
                    args.isCancel = true;
            }, self.uniqueID);
            _this._dbSet.isSubmitOnDelete = true;
            _this._addNewCommand = new RIAPP.TCommand(function (sender, param) {
                var item = self._dbSet.addNew();
                item.Data = JSON.stringify({});
            });
            _this._addNewAddrCommand = new RIAPP.TCommand(function (sender, param) {
                var curCustomer = self.currentItem.Customer;
                curCustomer.Addresses.addNew();
            }, self, function (s, p) {
                return !!self.currentItem;
            });
            _this._saveCommand = new RIAPP.Command(function (sender, param) {
                self.dbContext.submitChanges();
            }, self, function (s, p) {
                return self.dbContext.isHasChanges;
            });
            _this._undoCommand = new RIAPP.Command(function (sender, param) {
                self.dbContext.rejectChanges();
            }, self, function (s, p) {
                return self.dbContext.isHasChanges;
            });
            _this._propWatcher.addPropWatch(self.dbContext, 'isHasChanges', function (prop) {
                self._saveCommand.raiseCanExecuteChanged();
                self._undoCommand.raiseCanExecuteChanged();
            });
            _this._loadCommand = new RIAPP.TCommand(function (sender, data, viewModel) {
                viewModel.load();
            }, self, null);
            _this._dbSet.defineCustomerField(function (item) {
                var bag = item._aspect.getCustomVal("jsonBag");
                if (!bag) {
                    bag = new CustomerBag(item);
                    item._aspect.setCustomVal("jsonBag", bag);
                }
                return bag;
            });
            return _this;
        }
        CustomerViewModel.prototype._onCurrentChanged = function () {
            this._addNewAddrCommand.raiseCanExecuteChanged();
            this.raisePropertyChanged('currentItem');
        };
        CustomerViewModel.prototype.load = function () {
            var query = this.dbSet.createReadCustomerJSONQuery();
            query.pageSize = 50;
            query.orderBy('CustomerID');
            return query.load();
        };
        CustomerViewModel.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._dbSet) {
                this._dbSet.removeNSHandlers(this.uniqueID);
            }
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(CustomerViewModel.prototype, "dbSet", {
            get: function () { return this._dbSet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "addNewCommand", {
            get: function () { return this._addNewCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "addNewAddrCommand", {
            get: function () { return this._addNewAddrCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "saveCommand", {
            get: function () { return this._saveCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "undoCommand", {
            get: function () { return this._undoCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "currentItem", {
            get: function () { return this._dbSet.currentItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerViewModel.prototype, "loadCommand", {
            get: function () { return this._loadCommand; },
            enumerable: true,
            configurable: true
        });
        return CustomerViewModel;
    }(RIAPP.ViewModel));
    exports.CustomerViewModel = CustomerViewModel;
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            var _this = _super.call(this, options) || this;
            _this._dbContext = null;
            _this._errorVM = null;
            _this._customerVM = null;
            return _this;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this, options = self.options;
            this._dbContext = new DEMODB.DbContext();
            this._dbContext.initialize({ serviceUrl: options.service_url, permissions: options.permissionInfo });
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._customerVM = new CustomerViewModel(this);
            function handleError(sender, data) {
                self._handleError(sender, data);
            }
            ;
            this.addOnError(handleError);
            this._dbContext.addOnError(handleError);
            _super.prototype.onStartUp.call(this);
        };
        DemoApplication.prototype._handleError = function (sender, data) {
            debugger;
            data.isHandled = true;
            this.errorVM.error = data.error;
            this.errorVM.showDialog();
        };
        DemoApplication.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            try {
                self._errorVM.destroy();
                self._customerVM.destroy();
                self._dbContext.destroy();
            }
            finally {
                _super.prototype.destroy.call(this);
            }
        };
        Object.defineProperty(DemoApplication.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "dbContext", {
            get: function () { return this._dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "errorVM", {
            get: function () { return this._errorVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "customerVM", {
            get: function () { return this._customerVM; },
            enumerable: true,
            configurable: true
        });
        return DemoApplication;
    }(RIAPP.Application));
    exports.DemoApplication = DemoApplication;
    bootstrap.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
        args.isHandled = true;
    });
    function start(options) {
        options.modulesInits = {
            "COMMON": COMMON.initModule
        };
        bootstrap.init(function (bootstrap) {
            var ButtonsCSS = bootstrap.defaults.ButtonsCSS;
            ButtonsCSS.Edit = 'icon icon-pencil';
            ButtonsCSS.Delete = 'icon icon-trash';
            ButtonsCSS.OK = 'icon icon-ok';
            ButtonsCSS.Cancel = 'icon icon-remove';
        });
        return bootstrap.startApp(function () {
            return new DemoApplication(options);
        }, function (app) { }).then(function (app) {
            return app.customerVM.load();
        });
    }
    exports.start = start;
});
