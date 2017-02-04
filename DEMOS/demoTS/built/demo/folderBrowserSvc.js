var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp_shared", "jriapp_db"], function (require, exports, RIAPP, dbMOD) {
    "use strict";
    var FileSystemObjectEntity = (function (_super) {
        __extends(FileSystemObjectEntity, _super);
        function FileSystemObjectEntity(aspect) {
            return _super.call(this, aspect) || this;
        }
        FileSystemObjectEntity.prototype.toString = function () {
            return 'FileSystemObjectEntity';
        };
        Object.defineProperty(FileSystemObjectEntity.prototype, "Key", {
            get: function () { return this._aspect._getFieldVal('Key'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "ParentKey", {
            get: function () { return this._aspect._getFieldVal('ParentKey'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "Name", {
            get: function () { return this._aspect._getFieldVal('Name'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "Level", {
            get: function () { return this._aspect._getFieldVal('Level'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "HasSubDirs", {
            get: function () { return this._aspect._getFieldVal('HasSubDirs'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "IsFolder", {
            get: function () { return this._aspect._getFieldVal('IsFolder'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "fullPath", {
            get: function () { return this._aspect._getCalcFieldVal('fullPath'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "ExtraProps", {
            get: function () { return this._aspect._getCalcFieldVal('ExtraProps'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "Parent", {
            get: function () { return this._aspect._getNavFieldVal('Parent'); },
            set: function (v) { this._aspect._setNavFieldVal('Parent', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FileSystemObjectEntity.prototype, "Children", {
            get: function () { return this._aspect._getNavFieldVal('Children'); },
            enumerable: true,
            configurable: true
        });
        return FileSystemObjectEntity;
    }(RIAPP.CollectionItem));
    var FileSystemObjectDb = (function (_super) {
        __extends(FileSystemObjectDb, _super);
        function FileSystemObjectDb(dbContext) {
            var _this = this;
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "FileSystemObject" },
                childAssoc: ([{ "name": "ChildToParent", "parentDbSetName": "FileSystemObject", "childDbSetName": "FileSystemObject", "childToParentName": "Parent", "parentToChildrenName": "Children", "onDeleteAction": 1, "fieldRels": [{ "parentField": "Key", "childField": "ParentKey" }] }]),
                parentAssoc: ([{ "name": "ChildToParent", "parentDbSetName": "FileSystemObject", "childDbSetName": "FileSystemObject", "childToParentName": "Parent", "parentToChildrenName": "Children", "onDeleteAction": 1, "fieldRels": [{ "parentField": "Key", "childField": "ParentKey" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "Key", "isPrimaryKey": 1, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 255, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ParentKey", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 255, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 255, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Level", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "HasSubDirs", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "IsFolder", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "fullPath", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "", "nested": null }, { "fieldName": "ExtraProps", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "", "nested": null }, { "fieldName": "Parent", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "ParentKey", "nested": null }, { "fieldName": "Children", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
            _this = _super.call(this, opts) || this;
            _this._initItemFactory();
            return _this;
        }
        FileSystemObjectDb.prototype._initItemFactory = function () {
            this._itemFactory = function (aspect) { return new FileSystemObjectEntity(aspect); };
        };
        FileSystemObjectDb.prototype.findEntity = function (key) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        FileSystemObjectDb.prototype.toString = function () {
            return 'FileSystemObjectDb';
        };
        FileSystemObjectDb.prototype.createReadAllQuery = function (args) {
            var query = this.createQuery('ReadAll');
            query.params = args;
            return query;
        };
        FileSystemObjectDb.prototype.createReadChildrenQuery = function (args) {
            var query = this.createQuery('ReadChildren');
            query.params = args;
            return query;
        };
        FileSystemObjectDb.prototype.createReadRootQuery = function (args) {
            var query = this.createQuery('ReadRoot');
            query.params = args;
            return query;
        };
        FileSystemObjectDb.prototype.definefullPathField = function (getFunc) { this._defineCalculatedField('fullPath', getFunc); };
        FileSystemObjectDb.prototype.defineExtraPropsField = function (getFunc) { this._defineCalculatedField('ExtraProps', getFunc); };
        return FileSystemObjectDb;
    }(dbMOD.DbSet));
    exports.FileSystemObjectDb = FileSystemObjectDb;
    var DbSets = (function (_super) {
        __extends(DbSets, _super);
        function DbSets(dbContext) {
            var _this = _super.call(this, dbContext) || this;
            _this._createDbSet("FileSystemObject", FileSystemObjectDb);
            return _this;
        }
        Object.defineProperty(DbSets.prototype, "FileSystemObject", {
            get: function () { return this.getDbSet("FileSystemObject"); },
            enumerable: true,
            configurable: true
        });
        return DbSets;
    }(dbMOD.DbSets));
    exports.DbSets = DbSets;
    var DbContext = (function (_super) {
        __extends(DbContext, _super);
        function DbContext() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DbContext.prototype._initDbSets = function () {
            _super.prototype._initDbSets.call(this);
            this._dbSets = new DbSets(this);
            var associations = [{ "name": "ChildToParent", "parentDbSetName": "FileSystemObject", "childDbSetName": "FileSystemObject", "childToParentName": "Parent", "parentToChildrenName": "Children", "onDeleteAction": 1, "fieldRels": [{ "parentField": "Key", "childField": "ParentKey" }] }];
            this._initAssociations(associations);
            var methods = [{ "methodName": "ReadAll", "parameters": [{ "name": "includeFiles", "dataType": 2, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "infoType", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadChildren", "parameters": [{ "name": "parentKey", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "level", "dataType": 3, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }, { "name": "path", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 2 }, { "name": "includeFiles", "dataType": 2, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 3 }, { "name": "infoType", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 4 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadRoot", "parameters": [{ "name": "includeFiles", "dataType": 2, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "infoType", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": true }];
            this._initMethods(methods);
        };
        Object.defineProperty(DbContext.prototype, "associations", {
            get: function () { return this._assoc; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "dbSets", {
            get: function () { return this._dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "serviceMethods", {
            get: function () { return this._svcMethods; },
            enumerable: true,
            configurable: true
        });
        return DbContext;
    }(dbMOD.DbContext));
    exports.DbContext = DbContext;
});
