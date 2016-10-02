var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "jriapp_ui"], function (require, exports, RIAPP, uiMOD) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;
    var $doc = $(utils.dom.document);
    var $head = $("head");
    var $drag = null;
    var ID = "id";
    var PX = "px";
    var SIGNATURE = "JColResizer";
    var FLEX = "JCLRFlex";
    var _gridsCount = 0;
    var _created_grids = {};
    function _gridCreated(grid) {
        _created_grids[grid.uniqueID] = grid;
        _gridsCount += 1;
        if (_gridsCount === 1) {
            $(window).on('resize.' + SIGNATURE, onResize);
        }
    }
    function _gridDestroyed(grid) {
        delete _created_grids[grid.uniqueID];
        _gridsCount -= 1;
        if (_gridsCount === 0) {
            $(window).off('resize.' + SIGNATURE);
        }
        destroy(grid.grid);
    }
    $head.append("<style type='text/css'>  .JColResizer{table-layout:fixed;} .JCLRgrips{ height:0px; position:relative;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; } .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px} .JCLRLastGrip{position:absolute; width:1px; } .JCLRgripDrag{ border-left:1px dotted black;	} .JCLRFlex{width:auto!important;} .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");
    var init = function (grid, options) {
        var $table = grid.$table;
        var tb = $table[0];
        var style = window.getComputedStyle(tb, null);
        if (options.hoverCursor !== 'e-resize')
            $head.append("<style type='text/css'>.JCLRgrip .JColResizer:hover{cursor:" + options.hoverCursor + "!important}</style>");
        $table.addClass(SIGNATURE);
        var $gripContainer = $('<div class="JCLRgrips"/>');
        grid._getInternal().get$Header().before($gripContainer);
        var data = {
            options: options,
            mode: options.resizeMode,
            dc: options.disabledColumns,
            fixed: options.fixed,
            grips: [],
            $columns: [],
            w: $table.width(),
            $gripContainer: $gripContainer,
            cellspacing: parseInt(style.borderSpacing) || 2,
            borderW: parseInt(style.borderLeftWidth) || 1,
            len: 0
        };
        $table.data(SIGNATURE, data);
        if (options.marginLeft)
            $gripContainer.css("marginLeft", options.marginLeft);
        if (options.marginRight)
            $gripContainer.css("marginRight", options.marginRight);
        createGrips(grid);
    };
    var destroy = function (grid) {
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        if (!!data)
            data.$gripContainer.remove();
        $table.removeData(SIGNATURE);
        $table.removeClass(SIGNATURE + " " + FLEX);
    };
    var createGrips = function (grid) {
        var $table = grid.$table;
        var $allth = $(grid._tHeadCells);
        $allth = $allth.filter(":visible");
        var data = $table.data(SIGNATURE);
        data.len = $allth.length;
        $allth.each(function (index) {
            var $column = $(this);
            var isDisabled = data.dc.indexOf(index) != -1;
            var $grip = $(data.$gripContainer.append('<div class="JCLRgrip"></div>')[0].lastChild);
            $grip.append(isDisabled ? "" : data.options.gripInnerHtml).append('<div class="' + SIGNATURE + '"></div>');
            if (index == data.len - 1) {
                $grip.addClass("JCLRLastGrip");
                if (data.fixed)
                    $grip.html("");
            }
            $grip.bind('touchstart mousedown', onGripMouseDown);
            if (!isDisabled) {
                $grip.removeClass('JCLRdisabledGrip').bind('touchstart mousedown', onGripMouseDown);
            }
            else {
                $grip.addClass('JCLRdisabledGrip');
            }
            $column.w = $column.width();
            data.grips.push($grip);
            data.$columns.push($column);
            $column.width($column.w).removeAttr("width");
            $grip.data(SIGNATURE, { i: index, grid: grid, last: index == data.len - 1 });
        });
        if (!data.fixed) {
            $table.removeAttr('width').addClass(FLEX);
        }
        syncGrips(grid);
    };
    var syncGrips = function (grid) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        data.$gripContainer.width(data.w);
        for (var i = 0; i < data.len; i++) {
            var $column = data.$columns[i];
            var headerHeight = grid._getInternal().get$Header()[0].offsetHeight;
            var tableHeight = grid._getInternal().get$Wrapper()[0].offsetHeight;
            data.grips[i].css({
                left: $column.offset().left - $table.offset().left + $column.outerWidth(false) + data.cellspacing / 2 + PX,
                height: data.options.headerOnly ? headerHeight : (headerHeight + tableHeight)
            });
        }
        grid.updateColumnsSize();
    };
    var syncCols = function (grid, i, isOver) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        var gripData = $drag.data(SIGNATURE);
        var inc = gripData.x - gripData.l, c = data.$columns[i], c2 = data.$columns[i + 1];
        var w = c.w + inc;
        var w2 = c2.w - inc;
        c.width(w + PX);
        if (data.fixed) {
            c2.width(w2 + PX);
        }
        else if (data.options.overflow) {
            $table.css('min-width', data.w + inc);
        }
        if (isOver) {
            c.w = w;
            c2.w = data.fixed ? w2 : c2.w;
        }
    };
    var applyBounds = function (grid) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        var w = $.map(data.$columns, function (c) {
            return c.width();
        });
        $table.width(data.w = $table.width()).removeClass(FLEX);
        $.each(data.$columns, function (i, c) {
            c.width(w[i]);
            c.w = w[i];
        });
        $table.addClass(FLEX);
    };
    var onGripDrag = function (e) {
        if (!$drag)
            return;
        var gripData = $drag.data(SIGNATURE);
        var grid = gripData.grid;
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        var oe = e.originalEvent.touches;
        var ox = oe ? oe[0].pageX : e.pageX;
        var x = ox - gripData.ox + gripData.l;
        var mw = data.options.minWidth;
        var index = gripData.i;
        var l = data.cellspacing * 1.5 + mw + data.borderW;
        var last = index == data.len - 1;
        var min = index ? data.grips[index - 1].position().left + data.cellspacing + mw : l;
        var max = data.fixed ?
            (index == data.len - 1 ?
                (data.w - l) :
                (data.grips[index + 1].position().left - data.cellspacing - mw)) : Infinity;
        x = Math.max(min, Math.min(max, x));
        gripData.x = x;
        $drag.css("left", x + PX);
        if (last) {
            var column = data.$columns[index];
            gripData.w = column.w + x - gripData.l;
        }
        if (!!data.options.liveDrag) {
            if (last) {
                column.width(gripData.w);
                if (!data.fixed && data.options.overflow) {
                    $table.css('min-width', data.w + x - gripData.l);
                }
                else {
                    data.w = $table.width();
                }
            }
            else {
                syncCols(grid, index, false);
            }
            syncGrips(grid);
            var cb = data.options.onDrag;
            if (!!cb) {
                e.currentTarget = $table[0];
                cb(e);
            }
        }
        return false;
    };
    var onGripDragOver = function (e) {
        $doc.unbind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE).unbind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE);
        $head.find('#dragCursor').remove();
        if (!$drag)
            return;
        var gripData = $drag.data(SIGNATURE);
        var grid = gripData.grid;
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        $drag.removeClass(data.options.draggingClass);
        if (!(gripData.x - gripData.l == 0)) {
            var cb = data.options.onResize;
            var i = gripData.i;
            var last = i == data.len - 1;
            var c = data.$columns[i];
            if (last) {
                c.width(gripData.w);
                c.w = gripData.w;
            }
            else {
                syncCols(grid, i, true);
            }
            if (!data.fixed)
                applyBounds(grid);
            syncGrips(grid);
            if (!!cb) {
                e.currentTarget = $table[0];
                cb(e);
            }
        }
        $drag = null;
    };
    var onGripMouseDown = function (e) {
        var $grip = $(this);
        var gripData = $grip.data(SIGNATURE);
        var grid = gripData.grid;
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        var oe = e.originalEvent.touches;
        gripData.ox = oe ? oe[0].pageX : e.pageX;
        gripData.l = $grip.position().left;
        gripData.x = gripData.l;
        $doc.bind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE, onGripDrag).bind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE, onGripDragOver);
        if ($head.find('#dragCursor').length == 0)
            $head.append("<style id='dragCursor' type='text/css'>*{cursor:" + data.options.dragCursor + "!important}</style>");
        $grip.addClass(data.options.draggingClass);
        $drag = $grip;
        var gripCol = data.$columns[gripData.i];
        if (gripCol.locked) {
            for (var i = 0; i < data.len; i++) {
                var c = data.$columns[i];
                c.locked = false;
                c.w = c.width();
            }
        }
        return false;
    };
    var checkResize = function (grid) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var data = $table.data(SIGNATURE);
        var mw = 0;
        $table.removeClass(SIGNATURE);
        if (data.fixed) {
            data.w = $table.width();
            for (var i = 0; i < data.len; i++)
                mw += data.$columns[i].w;
            for (var i = 0; i < data.len; i++) {
                var col = data.$columns[i];
                col.css("width", Math.round(1000 * col.w / mw) / 10 + "%");
                col.locked = true;
            }
        }
        else {
            applyBounds(grid);
        }
        $table.addClass(SIGNATURE);
        syncGrips(grid);
    };
    var onResize = function () {
        RIAPP.Utils.core.iterateIndexer(_created_grids, function (name, gridView) {
            var grid = gridView.grid;
            checkResize(grid);
        });
    };
    var ResizableGrid = (function (_super) {
        __extends(ResizableGrid, _super);
        function ResizableGrid(options) {
            _super.call(this, options);
            var self = this, grid = self.grid;
            _gridCreated(this);
            var defaults = {
                resizeMode: 'fit',
                draggingClass: 'JCLRgripDrag',
                gripInnerHtml: '',
                liveDrag: false,
                minWidth: 15,
                headerOnly: false,
                hoverCursor: "e-resize",
                dragCursor: "e-resize",
                flush: false,
                marginLeft: null,
                marginRight: null,
                disable: false,
                partialRefresh: false,
                disabledColumns: [],
                onDrag: null,
                onResize: null
            };
            var opts = $.extend(defaults, options);
            opts.fixed = true;
            opts.overflow = false;
            switch (opts.resizeMode) {
                case 'flex':
                    opts.fixed = false;
                    break;
                case 'overflow':
                    opts.fixed = false;
                    opts.overflow = true;
                    break;
            }
            this._ds = grid.dataSource;
            init(grid, opts);
            self.bindDS(grid.dataSource);
            grid.addOnPropertyChange("dataSource", function (s, a) {
                self.unBindDS(self._ds);
                self.bindDS(grid.dataSource);
                self._ds = grid.dataSource;
            }, this.uniqueID);
            setTimeout(function () { checkResize(grid); }, 0);
        }
        ResizableGrid.prototype.bindDS = function (ds) {
            if (!ds)
                return;
            var self = this;
            ds.addOnCleared(function (s, a) { setTimeout(function () { syncGrips(self.grid); }, 0); }, this.uniqueID);
            ds.addOnFill(function (s, a) {
                setTimeout(function () { syncGrips(self.grid); }, 0);
            }, this.uniqueID);
        };
        ResizableGrid.prototype.unBindDS = function (ds) {
            if (!ds)
                return;
            ds.removeNSHandlers(this.uniqueID);
        };
        ResizableGrid.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            _gridDestroyed(this);
            this.unBindDS(this._ds);
            this._ds = null;
            _super.prototype.destroy.call(this);
        };
        return ResizableGrid;
    }(uiMOD.DataGridElView));
    exports.ResizableGrid = ResizableGrid;
    function initModule(app) {
        app.registerElView('resizable_grid', ResizableGrid);
    }
    exports.initModule = initModule;
});
