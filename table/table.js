"use strict";

if (window.table) throw new Error("the table has been defined.")

window.table = (function() {
    "use strict";

    const table = function (table_container, opt, ver) {
        "use strict";
        
        if (!table.pool) {
            table.pool = new Map();
        }
        if (table.pool.has(table_container)) {
            return table.pool.get(table_container);
        } else {
            table.pool.set(table_container, this);
        }

        // new API
        if (ver >= 2) {

            if (!table.version) {
                // 2' 2' 4
                const version = "02000000";
                Object.defineProperty(table, "version", {
                    enumerable: false,
                    configurable: false,
                    get: function () {
                        "use strict";

                        return { 0: version.slice(0,2), 1: version.slice(2,4), 2: version.slice(4) }
                    }
                });
                table.UNRENDERED = 0x00;
                table.RENDERED   = 0x01;
                table.SHOWN     = 0x02;
                table.HIDDEN    = 0x04;
                table.FREEZE_STATUS    = 0x10;
            }

            if (!table.lib.has("font_awesome")) {
                // table.importLib();
            }

            /* API table */
            // bordered
            this.bordered = opt.bordered || true;

            // columns
            Object.defineProperty(this, "columns", {
                enumerable: true,
                configurable: false,
                set: function (columns) {
                    "use strict";

                    if (!this.__columns__) {
                        this.__columns__ = {
                            section: null,        /* just holds section, checkbox or radio */
                            columns: null
                        }
                    }

                    if (!this.__columns__.section) {
                        this.__columns__.section = {
                            mount: false,
                            columns: null,    // only save a element for overload
                            checkbox: null,
                            __mark: null
                        };
                    }

                    this.__columns__.columns = columns; // assigning


                    if (this.mem) { // if already initialized memory for `this`, do following...
                        this.dataSource = [];
                        let ret = this.__generator_thead();
                        // clone `$1` to `$2`
                        this.__clone_colgroup(ret.colgroup.self, this.mem.body.table);
                    }

                },
                get: function () {
                    "use strict";

                    if (this.__columns__.section.mount) {
                        return this.__columns__.section.columns.concat(this.__columns__.columns);
                    }
                    return this.__columns__.columns;
                }
            });
            this.columns = opt.columns;

            // define dataSource
            Object.defineProperty(this, "dataSource", {
                enumerable: true,
                configurable: false,
                set: function (data) {
                    "use strict";

                    if (!this.__trs._props.rendered_rows) {
                        this.__trs._props.rendered_rows = new Map(); // includes has been rendered row
                    } else {
                        for (let [k, v] of this.__trs._props.rendered_rows) {
                            v.tr.remove();
                        }

                        this.__trs._props.rendered_rows.clear();
                        this.__trs._props.is_tree_data = false; // by default, `dataSource` isn't nested.
                        this.__trs._props.expanded_rows_change = [];
                    }

                    if (this.__row_selection__ && this.__row_selection__.selectedRowKeys) {
                        this.__row_selection__.selectedRowKeys = [];
                        this.__row_selection__.selectedRows = [];
                    }

                    this.__trs._props.selected_rows = new Map();
                    this.__trs._props.all_rows = new Map();

                    // row selection
                    if (this.__columns__.section.checkbox) {
                        this.__columns__.section.checkbox.checked = false;
                    }

                    const props = this.__trs._props;
                    this.__trs = [];
                    this.__trs._props = props;
                    this.__data_source__ = data;
                    if (data.length === 0) {
                        this.mem.self.classList.add("table2-no-data");
                    } else {
                        this.mem.self.classList.remove("table2-no-data");
                        
                        /*
                        o: all_rows
                        f: whether `dataSource` is nested
                        size: `dataSource` size */
                        let o, f = 0, size = 0;

                        // async render
                        const as  = (function(is_nested){
                            "use strict";
                            return new Promise((function(resolve, reject) {
                                this.__trs._props.is_tree_data = is_nested;
                                this.__set_data_source({ tr: { rowIndex: -1 } }, this.__data_source__, this.__trs, 0, table.RENDERED | table.SHOWN);
                            }).bind(this));
                        }).bind(this);

                        // prehandle
                        const pre = (function(data) {
                            "use strict";
                            for (let i = 0; i < data.length; ++i, ++size) {
                                o = {};
                                for (let k in data[i]) {
                                    // filter children
                                    if (k !== "children") o[k] = data[i][k];
                                }
                                this.__trs._props.all_rows.set(data[i].key, o);

                                if (data[i].children && data[i].children.length > 0) {

                                    if (!f) {  
                                        f = 1;                   
                                        as(true);
                                    }

                                    pre(data[i].children);
                                }
                            }
                        }).bind(this);

                        pre(data);

                        size > 2000 && console.warn("[dataSource.length] %d over then 2000.", size);

                        !f && as(false);
                    }
                },
                get: function () {
                    "use strict";

                    return this.__data_source__;
                }
            });




            Object.defineProperty(this, "scroll", {
                enumerable: true,
                configurable: false,
                set: function (scroll) {
                    "use strict";

                    // receive both properties `x` & `y`
                    // width(min-width):
                    // 1000 => "1000px"
                    // "120%" => "120%"
                    if (scroll.constructor !== Object) {
                        this.__scroll__ = {};
                    } else {
                        this.__scroll__ = scroll;
                    }
                    
                    if (this.__scroll__.x || this.__scroll__.y) {
                        this.__fixed_header();
                    } else {
                        // nothing on current version.
                    }
                },
                get: function () {
                    "use strict";

                    return this.__scroll__;
                }
            });

            // set `padding` in the cell of table
            Object.defineProperty(this, "size", {
                enumerable: false,
                configurable: false,
                set: function (size) {
                    "use strict";

                    this.__size__ = size;
                    this.__set_size();
                },
                get: function () {
                    "use strict";

                    return this.__size__;
                }
            });

            Object.defineProperty(this, "bordered", {
                enumerable: false,
                configurable: false,
                set: function (bordered) {
                    "use strict";

                    this.__bordered__ = !!bordered;
                    this.__set_border();
                },
                get: function () {
                    "use strict";

                    return this.__bordered__;
                }
            });

            // rowSelection
            Object.defineProperty(this, "rowSelection", {
                enumerable: true,
                configurable: false,
                set: function (row_selection) {
                    "use strict";

                    if (!this.__row_selection__) { // init
                        this.__row_selection__ = {};
                    }

                    let mounted = true;
                    if (typeof row_selection === "object") {
                        this.__row_selection__.onChange = row_selection.onChange;
                        this.__row_selection__.onSelect = row_selection.onSelect;
                        this.__row_selection__.onSelectAll = row_selection.onSelectAll;
                        this.__row_selection__.onFocus = row_selection.onFocus;
                        this.__row_selection__.type = row_selection.type || "checkbox";
                    } else if (typeof row_selection === "boolean") {
                        mounted = row_selection;
                        this.__row_selection__.type = this.__row_selection__.type || "checkbox";
                    }

                    if (!this.__row_selection__.selectedRowKeys) {
                        this.__row_selection__.selectedRowKeys = [];
                        this.__row_selection__.selectedRows = [];
                    } // init

                    let last = this.__columns__.section.mount;

                    // set property `__columns__.section`
                    this.__set_columns_for_extended(mounted);

                    // required initialized
                    if (this.mem && last !== mounted) {
                        this.__set_row_selection();
                    }
                },
                get: function () {
                    "use strict";

                    return this.__row_selection__;
                }
            });

            // rowSelection
            this.rowSelection = opt.rowSelection || false;


            Object.defineProperty(this, "selectedRowKeys", {
                enumerable: true,
                configurable: false,
                set: function (keys) {
                    "use strict";

                    this.__set_selected_rows_keys(keys);
                },
                get: function () {
                    "use strict";

                    return undefined;
                }
            });


            this.indentSize = opt.indentSize || 20;

            this.defaultExpandAllRows = opt.defaultExpandAllRows || false;

            this.__init__2(table_container);


            this.scroll = opt.scroll || { "x": "100%", "y": 480 };
            this.size = opt.size || "default";
            this.bordered = opt.bordered || true;
            this.dataSource = opt.dataSource || [];
            this.onChange = opt.onChange && this.onChange;
            this.onSelect = opt.onSelect;

            if (opt.onFocus) this.onFocus = opt.onFocus;
            if (opt.onBlur) this.onBlur = opt.onBlur;

            return;
        }

        this.w = null;
        // this.h = [];

        this.head = {
            rowfunc: null,
            colfuncs: null,
            sorter: null
        };

        this.body = {
            rowfuncs: null,
            colfuncs: null
        };

        this.__colarr = null; // 一列表格转数组


        if (opt) {
            if (opt.head) {
                this.head = opt.head;
                /*
                if (opt.head.colfuncs) {
                    this.head.colfuncs = opt.head.colfuncs;
                }*/
            }
            if (opt.body) {
                /*
                if (opt.body.rowfuncs) {
                    this.body.rowfuncs = opt.body.rowfuncs;
                }*/
                this.body = opt.body;
            }
            if (opt.w) {
                this.w = opt.w;
            }

            this.columns = opt.columns || null;
            this.rowSelection = opt.rowSelection || null;
            // since: 2018/1/26
            this.onChange = opt.onChange || null; // 分页、排序、筛选变化时触发
        }

        // 选中一行的回调函数
        this.rows_cb = [];

        this.style = {
            root_class: "table-container",
            empty_class: "table-empty",
            thead_cell_class: "cell",
            tbody_cell_class: "cell",
            tbody_row_select_class: "select"
        };

        this.gid = table.GID();
        this.__styletemplate = "";


        this.mem = null;
        this.__init(table_container);

        /*
        columns
        since: 2018/1/26 */
        if (this.columns) {
            if (!opt.hasOwnProperty("dataSource")) {
                //console.assert("table缺少属性 dataSource");
                //throw new Error("[this.dataSource] is not exist!");
            }


            Object.defineProperty(this, "dataSource", {
                enumerable: true,
                configurable: true,
                set: function (newValue) {
                    this._dataSource = newValue;
                    this.__set_data(newValue);
                },
                get: function () {
                    return this._dataSource;
                }
            });
            //this.dataSource = opt.dataSource; // 表数据
            //var push = this.dataSource.push;
        }

        this.create(opt);
    }
    /* deprecated */
    table.prototype.__init = function (c) {

        if (this.columns) {
            c.appendChild(this.__create_table(c));
        }

        let thead = c.children[0].children[0];
        let tbody = c.children[0].children[1];

        this.mem = {
            root: c,
            table: c.children[0],
            head: {
                root: thead,
                row: thead.children[0],
                cols: thead.children[0].children
            },
            body: {
                root: tbody,
                rows: tbody.children
            },
            __styletemplate: document.createElement("style")
        };

        this.mem.root.appendChild(this.mem.__styletemplate);
        this.mem.root.classList.add(this.style.root_class);

        this.__addEventListener();

        this.mem.root.setAttribute("tableid", this.gid);

        if (this.w) {
            this.generateStyle();
        }

        if (this.columns) {

            if (!table.lib.has("font_awesome")) {
                table.importLib();
            }

            let __offset = 0;
            if (this.rowSelection && this.rowSelection.type) {
                __offset = 1;
            }

            for (let i = 0 + __offset; i < this.mem.head.cols.length; ++i) {

                if (this.columns[i - __offset].sorter) {
                    this.__create_sorter(this.mem.head.cols[i])
                }
            }

        }
    };
    /* deprecated */
    // el is parentNode
    table.prototype.__create_sorter = function (el) {
        let wrap = document.createElement("div");
        wrap.className = "title-wrap";

        let up = document.createElement("i");
        up.className = "fa fa-caret-up";
        up.title = "↑";

        let down = document.createElement("i");
        down.className = "fa fa-caret-down";
        down.title = "↓";

        let sort = document.createElement("span");
        sort.appendChild(up);
        sort.appendChild(down);

        let t = document.createElement("span");
        t.innerHTML = el.innerHTML;

        wrap.appendChild(t);
        wrap.appendChild(sort);

        el.innerHTML = "";

        el.appendChild(wrap);
    }
    /* deprecated */
    // create the thead if has this.columns
    table.prototype.__create_table = function (c) {
        let dfg = document.createDocumentFragment();

        let table = document.createElement("div");
        table.classList.add("table");

        let thead = document.createElement("div");
        thead.classList.add("table-head");

        let tbody = document.createElement("div");
        tbody.classList.add("table-content");

        table.appendChild(thead);
        table.appendChild(tbody);

        // head
        let row = document.createElement("div");
        row.classList.add("table-row");

        // type: add checkbox or radio
        if (this.rowSelection && this.rowSelection.type) {
            if (!this._dataSource) this._dataSource = new Array(31);

            /* [init] __selected_rows */
            /* [0]: 全选状态 [1]: 选中状态 [2]: dom checkbox */
            this.rowSelection.__selected_rows = new Array(3);
            this.rowSelection.__selected_rows[2] = {};
            this.__reset_selected_rows();

            // checkbox of thead
            this.rowSelection.__selected_rows[2].head = this.__add_select_type(-1);  // key is -1 only thead

            this.w.unshift("38px");
            let cell = document.createElement("div");
            cell.classList.add("table-cell");
            this.rowSelection.__selected_rows[2].head.setAttribute("style", "position: relative;top: calc(50% - 7px);left: calc(50% - 7px);");
            cell.appendChild(this.rowSelection.__selected_rows[2].head);
            dfg.appendChild(cell);

            // this.w.shift(); // do not remember.
        }

        for (let i = 0; i < this.columns.length; ++i) {
            let cell = document.createElement("div");
            cell.classList.add("table-cell");
            cell.innerHTML = this.columns[i].title;

            dfg.appendChild(cell);
        }

        row.appendChild(dfg);
        thead.appendChild(row);

        return table;
    };

    /* deprecated */
    table.prototype.__reset_selected_rows = function () {
        /* [0]: 所有key [1]: 选中key [2]: dom checkbox */
        this.rowSelection.__selected_rows[0] = new Map();
        this._dataSource.forEach(function (t, i) {
            let key = t.hasOwnProperty("key") ? t.key : i;
            this.rowSelection.__selected_rows[0].set(key, t);
        }, this);
        this.rowSelection.__selected_rows[1] = new Map();
        this.rowSelection.__selected_rows[2].body = [];
    };

    /* deprecated */
    // select type
    table.prototype.__add_select_type = function (key) {

        let type = this.rowSelection.type,
            label = document.createElement("label"),
            input = document.createElement("input"),
            span = document.createElement("span"),
            wrap = document.createElement("div");
        label.appendChild(input);
        label.appendChild(span);
        if (type === "checkbox") {
            wrap.className = "checkbox";
            input.setAttribute("type", "checkbox");
            wrap.appendChild(label);
        } else if (type === "radio") {
            // nothing...
        }


        span.__table_gid = this.gid; // -1: head
        span.__table_key = key;
        wrap.setAttribute("__table_key", key); // -1: head easier
        input.__table_gid = this.gid;
        input.__table_key = key;

        let _this = this;
        span.addEventListener("click", function (e) {
            e.stopPropagation();
            let key = this.__table_key;

            let checked = !input.checked;

            if (key === -1) {
                // [1] selected
                if (checked) {
                    _this.rowSelection.__selected_rows[0].forEach(function (v,k) {
                        _this.rowSelection.__selected_rows[1].set(k,v);
                    })
                } else {
                    _this.rowSelection.__selected_rows[1] = new Map();
                }

            } else { // if (key >= 0) {

                if (checked) {
                    _this.rowSelection.__selected_rows[1].set(key, _this._dataSource[key]);// [1] selected checkbox
                } else {
                    _this.rowSelection.__selected_rows[1].delete(key);// [1] selected checkbox
                }
            }
            _this.__change_checkbox(key);

        }, false);

        return wrap;
    };


    /* deprecated */
    table.prototype.__change_checkbox = function (key) {
        let s = this._dataSource.length,
            count = this.rowSelection.__selected_rows[0].size,
            size  = this.rowSelection.__selected_rows[1].size;


        // indeterminate state checkbox
        if (size < count && size > 0) {
            // this.rowSelection.__selected_rows[2].head.children[0].children[0].checked = false;
            this.rowSelection.__selected_rows[2].head.children[0].children[0].indeterminate = true;
            this.rowSelection.__selected_rows[2].head.children[0].children[0].classList.add("checkbox-indeterminate");
        } else if (size === 0) {
            // this.rowSelection.__selected_rows[2].head.children[0].children[0].checked = false;
            this.rowSelection.__selected_rows[2].head.children[0].children[0].indeterminate = false;
            this.rowSelection.__selected_rows[2].head.children[0].children[0].classList.remove("checkbox-indeterminate");
        } else if (size === count) {
            this.rowSelection.__selected_rows[2].head.children[0].children[0].indeterminate = false;
            this.rowSelection.__selected_rows[2].head.children[0].children[0].classList.remove("checkbox-indeterminate");
        }

        if (key === -1) {
            if (size === count) {// 全选
                for (let i = 0; i < s; ++i) {
                    this.rowSelection.__selected_rows[2].body[i].children[0].children[0].checked = true;
                }
            } else if (size === 0) { // 全不选
                for (let i = 0; i < s; ++i) {
                    this.rowSelection.__selected_rows[2].body[i].children[0].children[0].checked = false;
                }
            }
        }
    }
    /* deprecated */
    table.prototype.__set_data = function (data) {

        let i;
        let __offset = 0, _this = this, key = 0;

        if (this.rowSelection && this.rowSelection.type) {
            this.__reset_selected_rows();
            this.__change_checkbox(0);
            this.rowSelection.__selected_rows[2].head.children[0].children[0].checked = false;
            __offset += 1;
            this.columns.unshift({  // front_push if has [this.rowSelection.type] checkbox
                dataIndex: Date.now(),
                render: function () {
                    // __selected_rows[2]: dom of checkbox
                    let chkbox = _this.__add_select_type(key);
                    chkbox.setAttribute("style", "position: relative;top: calc(50% - 7px);left: calc(50% - 7px);");
                    _this.rowSelection.__selected_rows[2].body[key++] = chkbox;
                    return chkbox;
                }
            })
        }


        for (i = 0; i < data.length; ++i) {

            let row = this.mem.body.rows[i] || null;

            // add row
            if (!row) {
                row = document.createElement("div");
                row.classList.add("table-row");
                this.mem.body.root.appendChild(row);
            }

            // add cell to row of tbody
            for (let j = 0; j < this.columns.length; ++j) {
                // get val by dataIndex of columns[j]
                let val = data[i][this.columns[j].dataIndex];

                let cell = row.children[j] || null;

                // create a cell in the row...
                if (!cell) {
                    cell = document.createElement("div");
                    cell.classList.add("table-cell");
                    row.appendChild(cell);
                } else {
                    cell.innerHTML = "";
                }

                // render: 生成复杂数据的渲染函数，参数分别为当前行的值，当前行数据，行索引
                // function render(text, record, index)
                let dom;
                if (this.columns[j].render) {
                    dom = this.columns[j].render(val, data[i], i);

                    if (/html.*element/ig.test(Object.prototype.toString.call(dom).slice(8, -1))) {
                        cell.appendChild(dom);
                    }
                }

                if (!cell.innerHTML) {
                    cell.innerHTML = dom || val;
                }
            }
        }


        // remove extra rows of tbody
        while (this.mem.body.rows[i]) {
            this.mem.body.root.removeChild(this.mem.body.rows[i]);
        }

        if (this.rowSelection && this.rowSelection.type) {
            this.columns.shift(); // do not remember.
        }



        this.create({});
    };

    /* deprecated */
    table.prototype.setState = function (obj) {
        for (let x in obj) {
            this[x] = obj[x];
        }
    };

    /* deprecated */
    /**
     *
     * @param {Object} opt
     */
    table.prototype.create = function (opt) {
        let rows = this.mem.body.root.children; // rows of tbody

        if (rows.length === 0) {
            this.mem.table.classList.add(this.style.empty_class);
        } else if (rows.length > 0) {
            this.mem.table.classList.remove(this.style.empty_class);
            for (let i = 0; i < rows.length; ++i) {
                rows[i].setAttribute("tabindex", -1);

                if (!this.rows_cb[i]) {
                    this.rows_cb[i] = this.__tbodyrowclick.bind(this);
                    rows[i].addEventListener("click", this.rows_cb[i], true);
                } else {
                    if (!this.columns) { // Automatic management without MVVM
                        rows[i].removeEventListener("click", this.rows_cb[i], true);
                        this.rows_cb[i] = this.__tbodyrowclick.bind(this);
                        rows[i].addEventListener("click", this.rows_cb[i], true);
                    }
                }

                Array.prototype.forEach.call(rows[i].children, function (ele) {
                    ele.title = ele.innerText;
                });
            }
        }
        this.__resize();

        this.__remap();
    };
    /* deprecated */

    /**
     * @param e
     */
    table.prototype.__tbodyrowclick = function (e) {
        if (this.prevselected_row) {
            this.prevselected_row.classList.remove(this.style.tbody_row_select_class);
        }
        this.currselected_row = e.currentTarget;
        this.prevselected_row = e.currentTarget;

        this.currselected_row.classList.add(this.style.tbody_row_select_class);


        if (this.rowSelection) {
            this.__row_selection(e);
        } else if (this.body.rowfuncs) {
            this.body.rowfuncs(e.currentTarget, e); // [deprecated]this.body.rowfuncs
        }
    };
    /* deprecated */
    // since: 2018/1/29
    table.prototype.__row_selection = function (event) {

        // 用户手动选择/取消选择某列的回调
        if (this.rowSelection.onSelect) {
            for (let i = 0; i < this.mem.body.rows.length; ++i) {
                if (event.currentTarget === this.mem.body.rows[i]) {

                    // return if clicked the checkbox of this table.
                    if (event.target.tagName.toLowerCase() === "span" && event.target.__table_gid === this.gid) {
                        return;
                    }

                    let selectedRows,selectedRowsArr = [], selected;
                    if (this.rowSelection.__selected_rows) {
                        selectedRows = this.rowSelection.__selected_rows[1];
                        selected = selectedRows.size > 0 ? this.rowSelection.__selected_rows[1].has(i) : false;
                        this.rowSelection.__selected_rows[1].forEach(function (t, k) {
                            selectedRowsArr.push(t);
                        });
                    } else {
                        selectedRows = [this._dataSource[i]];
                    }

                    // callback only set this.rowSelection.type
                    if (this.rowSelection.type &&
                        event.target.tagName.toLowerCase() === "input" && event.target.__table_gid === this.gid) {
                        this.__row_select_onchange();
                    }

                    // Function(record, selected, selectedRows)
                    this.rowSelection.onSelect(this._dataSource[i], selected, selectedRowsArr, event);
                    break;
                }
            }
        }
    };
    /* deprecated */
    table.prototype.__tbodyrowblur = function (e) {
        //this.prevselected_row.classList.remove(this.style.tbody_row_select_class);
    };


    /* deprecated */
    /**
     * 选中项发生变化的时的回调
     * Function(selectedRowKeys, selectedRows)
     * @private
     */
    table.prototype.__row_select_onchange = function () {
        if (this.rowSelection.onChange) {
            let selected_row_keys = [], selected_rows = [];

            this.rowSelection.__selected_rows[1].forEach(function(v,k) {
                selected_row_keys.push(k);
                selected_rows.push(v);
            });
            this.rowSelection.onChange(selected_row_keys, selected_rows);
        }
    };
    /* deprecated */
    /**
     * 表头列回调
     * @param e
     *
     */
    table.prototype.__headcolfunc = function (e) {

        // checkbox & radio
        if (e.target.tagName.toLowerCase() === "input") {
            if (this.rowSelection && this.rowSelection.type) {
                this.__row_select_onchange();
            }
        }

        let f = -1; // flag that try call the default func

        Array.prototype.find.call(this.mem.head.cols, function (el, idx) {
            if (e.currentTarget === el) {

                if (this.columns && this.columns[idx]) {
                    // sorter
                    if (this.columns[idx].sorter) {

                        if (!this.columns[idx].hasOwnProperty("sortOrder")) {
                            this.columns[idx].sortOrder = false;
                        }

                        let order;

                        let column = {
                            dataIndex: this.columns[idx].dataIndex,
                            key: this.columns[idx].key,
                            sortOrder: this.columns[idx].sortOrder,
                            title: this.columns[idx].title
                        };

                        // icon of sort
                        if (e.target.classList.contains("fa-caret-up")) {

                            if (this.columns[idx].sortOrder === "ascend") {
                                order = false;
                                e.target.classList.remove("select");
                            } else {
                                order = "ascend";
                                e.target.classList.add("select");
                                e.target.nextElementSibling.classList.remove("select");
                            }

                        } else if (e.target.classList.contains("fa-caret-down")) {

                            if (this.columns[idx].sortOrder === "descend") {
                                order = false;
                                e.target.classList.remove("select");
                            } else {
                                order = "descend";
                                e.target.classList.add("select");
                                e.target.previousElementSibling.classList.remove("select");
                            }

                        } else {
                            f = idx;  // try call default
                            return true; // shouldn't sort
                        }

                        let obj = {
                            column: column,
                            columnKey: this.columns[idx].key,
                            field: this.columns[idx].field || this.columns[idx].title,
                            order: order,
                            __colarr: this.__colarr[idx]
                        };

                        if (typeof this.columns[idx].sorter === "function") {
                            //Array.prototype.sort
                            //this.columns[idx].sorter

                        }

                        this.__onchange({}, {}, obj, e);

                        this.columns[idx].sortOrder = order;
                    }

                } else {
                    f = idx;
                }

                return true;
            }
        }, this);

        // default
        if (f > -1 && this.head.colfuncs && this.head.colfuncs[f]) {
            this.head.colfuncs[f](this.__colarr[f], e);
        }
    };
    /* deprecated */
    /**
     * brief 分页、排序、筛选变化时触发
     *
     * @param pagination
     * @param filters
     * @param sorter
     * @param e
     * @private
     */
    table.prototype.__onchange = function (pagination, filters, sorter, e) {
        if (this.onChange) {
            this.onChange(pagination, filters, sorter, e);
        }
    };
    /* deprecated */
    /**
     * resize after update table or window.resize
     */
    table.prototype.__resize = function (e) {
        /* auto match width */
        this.mem.head.root.style.width = "";

        let basew = 0;
        if (this.mem.body.root.children.length > 0) {
            basew = this.mem.body.rows[0].clientWidth;
        }

        if (basew === 0) return;

        // fixed width of thead
        this.mem.head.root.style.width = basew + "px";
    };
    /* deprecated */
    table.prototype.__remap = function () {
        this.__colarr = [];
        Array.prototype.forEach.call(this.mem.body.rows, function (el, i) {
            for (let i2 = 0; i2 < this.mem.body.rows[i].children.length; ++i2) {
                if (!this.__colarr[i2]) {
                    this.__colarr[i2] = [];
                }

                this.__colarr[i2][i] = this.mem.body.rows[i].children[i2];
            }
        }, this);
    };
    /* deprecated */
    table.prototype.__addEventListener = function () {
        // head of table
        Array.prototype.forEach.call(this.mem.head.cols, function (el, idx) {
            el.addEventListener("click", this.__headcolfunc.bind(this), false);
        }, this);

        // autoresize
        window.addEventListener("resize", this.__resize.bind(this), false);
    };

    /* deprecated */
    // 设置单元格宽
    /**
     * todo 支持百分比宽：
     *     width: 12.5%;
         flex-grow: 0;
    * @param addtionstyle
    * @param colpos
    */
    table.prototype.generateStyle = function (addtionstyle, colpos) {
        if (!this.w) return;
        var stylestrbuff = "";
        var csspropsstr = "";
        this.w.forEach(function (width, i) {
            if (width.indexOf("*") > 0) {  // "100*" 自动缩放 100为最小宽度100px
                csspropsstr = "width:" + (parseFloat(width)) + "px;";
            } else if (width.indexOf("px") > 0) {  // "29px" 固定宽度
                csspropsstr = "width:" + parseFloat(width) + "px;flex-grow: 0;";
            }

            if (i === colpos - 1) {
                csspropsstr += addtionstyle;
            }

            // compatible style
            stylestrbuff += "[tableid='" + this.gid + "'] .row .cell:nth-of-type(" + (i + 1) + "){" + csspropsstr + "}";

            // replace of above's
            stylestrbuff += "[tableid='" + this.gid + "'] .table-row .table-cell:nth-of-type(" + (i + 1) + "){" + csspropsstr + "}";
        }, this);
        this.__styletemplate = stylestrbuff;
        this.mem.__styletemplate.innerText = stylestrbuff;
    };

    table.GID = function () {

        return (Math.random()).toString(16).slice(2);
    };

    table.prototype.destory = function () {
        let rows = this.mem.body.root.children; // rows of tbody

        for (let i = 0; i < rows.length; ++i) {
            rows[i].addEventListener("click", this.rows_cb[i], false);
        }
    };


    table.importLib = function () {
        /* for font_awesome */
        table.lib.set("font_awesome", "<link href=\"http://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css\" rel=\"stylesheet\">");
        if (document.head.innerHTML.search(/awesome/i) === -1) {
            document.head.innerHTML += table.lib.get("font_awesome");
        }
    }

    table.lib = new Map();

    /* inside implement
    * reference https://ant.design/components/checkbox-cn */
    table.__checkbox = function (dom_c, opt) {

        let mem = {
            self: document.createElement("div"),
            label: {
                self: document.createElement("label"),
                input: document.createElement("input"),
                span: document.createElement("span"),
                text: document.createElement("text")
            }
        };

        mem.label.input.setAttribute("type", "checkbox");
        mem.label.self.appendChild(mem.label.input);
        mem.label.self.appendChild(mem.label.span);
        mem.label.self.appendChild(mem.label.text);
        mem.self.className = "checkbox";
        mem.self.appendChild(mem.label.self);


        table.__proto__.__onchange = function(e) {
            this.indeterminate = false;
            if (this.onChange) {
                this.onChange(e, this.__key);
            }
        }
        mem.label.input.addEventListener("change", table.__proto__.__onchange.bind(this));


        this.mem = mem;

        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: false,
            set: function (new_value) {
                this.mem.label.text.innerText = new_value;
            },
            get: function () {
                return this.mem.label.text.innerText;
            }
        });

        Object.defineProperty(this, "indeterminate", {
            enumerable: false,
            configurable: false,
            set: function (new_value) {
                this.mem.label.input.className = !!new_value ? "checkbox-indeterminate" : "";
                this.mem.label.input.indeterminate = !!new_value;
            },
            get: function () {
                return this.mem.label.input.indeterminate;
            }
        });

        Object.defineProperty(this, "checked", {
            enumerable: false,
            configurable: false,
            set: function (checked) {
                this.mem.label.input.checked = !!checked;
                this.indeterminate = false;
            },
            get: function () {
                return this.mem.label.input.checked;
            }
        });

        Object.defineProperty(this, "disabled", {
            enumerable: false,
            configurable: false,
            set: function (disabled) {
                if (!!disabled) {
                    this.mem.self.classList.add("checkbox-disabled");
                    this.mem.label.input.disabled = true;
                } else {
                    this.mem.self.classList.remove("checkbox-disabled");
                    this.mem.label.input.disabled = false;
                }
            },
            get: function () {
                return this.mem.label.input.disabled;
            }
        });

        if (opt) {
            this.defaultChecked = opt.defaultChecked || false;
            this.onChange = opt.onChange;
            this.autoFocus = opt.autoFocus || false;
            if (this.autoFocus) {
                this.mem.self.setAttribute("tabindex", "-1");
            }
            this.label = opt.label ? opt.label : "";
            this.indeterminate = opt.indeterminate || false;
            this.disabled = opt.disabled || false;
        }

        dom_c.appendChild(this.mem.self);
    }


    // ver 2

    table.prototype.__init__2 = function (c) {
        "use strict";

        this.mem = {
            self: c
        }
        this.mem.self.classList.add("table2-container");

        this.mem.content = {
            self :document.createElement("div")
        }
        this.mem.content.self.classList.add("table2-content");


        this.__init_header();
        this.__init_body();

        this.mem.self.appendChild(this.mem.content.self);
    }

    table.prototype.__init_header = function() {
        "use strict";

        // generate the thead of table
        this.__generator_thead();

        if (this.scroll) {
            // generate table2-header and fixed the header,
            // then set(init) table2-scroll and append node of header and body.
            this.__fixed_header();

        } else {
            // following tbody
        }
    }

    // return object with thead info
    table.prototype.__generator_thead = function () {
        "use strict";

        if (!this.mem.thead) {
            /* init */
            let thead = document.createElement("thead");
            thead.classList.add("table2-thead");
            this.mem.thead = { self: thead };
            this.mem.thead_colgroup = { self: document.createElement("colgroup") }; // the `colgroup` holds each width of `th(td)`
            this.head_props = {};
        }

        if (!this.head_props.cols_width) {
            this.head_props.cols_width = {
                section: [],   // for checkbox or radio
                columns: []    // for normal columns
            };
        }
        this.head_props.cols_width.columns = [];

        this.head_props.deep = this.__get_deep_with("children", this.columns);

        // use `fragment`
        let dfg = document.createDocumentFragment();
        for (let i = 0; i < this.head_props.deep; ++i) {
            let tr = document.createElement("tr");
            dfg.appendChild(tr);
        }

        // remove children first
        while (this.mem.thead.self.childElementCount > 0) {
            this.mem.thead.self.lastChild.remove();
        }

        // render content by columns
        // `__thead_render` save each  width of column to  `cols_width`
        this.__thead_render(this.columns, this.head_props.deep, dfg);
        // render colgroup by `cols_width` for table
        this.__thead_render_colgroup(this.head_props.deep);

        this.mem.thead.self.appendChild(dfg);

        return { thead: this.mem.thead, colgroup: this.mem.thead_colgroup };
    }

    // render section with rowSelection
    table.prototype.__thead_render_section = function(rowspan) {
        "use strict";

        if (this.__row_selection__.type === "checkbox") {

            if (this.__columns__.section.th) {
                return this.__columns__.section.th;
            }

            // self holds a pointer of dom
            let th = document.createElement("th");
            th.classList.add("table2-selection-column");

            if (rowspan > 0) th.rowSpan = rowspan; // dont forget

            let chk = new table.__checkbox(th, {
                onChange: this.__checkbox_change_all.bind(this)
            });

            // holds pointers
            this.__columns__.section.checkbox = chk;
            this.__columns__.section.th = th;

            // return object of th `{ self: dom, checkbox: object }`
            return this.__columns__.section.th;
        }
    }

    table.prototype.__thead_render = function (columns, rdeep, root_node) {
        "use strict";

        let dfg = document.createDocumentFragment();

        for (let i = 0; i < columns.length; ++i) {

            let th;

            if (columns[i].__mark === this.__columns__.section.__mark) {

                if (this.__columns__.section.mount) {
                    th = this.__thead_render_section(this.head_props.deep);
                    this.head_props.cols_width.section[0] = 0;
                }

            } else if (columns[i].children) { // recursive by tag `children`

                th = document.createElement("th");

                // colSpan
                if (columns[i].hasOwnProperty("colSpan") && columns[i].colSpan > 0) {
                    th.colSpan = columns[i].colSpan; // custom colSpan
                } else {
                    th.colSpan = this.__get_leaf_on_branch_by("children", columns[i].children);
                }

                this.__thead_render(columns[i].children, rdeep - 1, root_node);
                const span = document.createElement("span");
                span.append(columns[i].title);
                th.append(span);

            } else { // no branch

                th = document.createElement("th");
                if (rdeep > 1) th.rowSpan = rdeep;
                const span = document.createElement("span");
                span.append(columns[i].title);

                this.head_props.cols_width.columns.push(columns[i].width);

                // generator sorter
                if (columns[i].sorter) {
                    span.append(this.__generator_sorter(columns[i]));
                }

                th.append(span);

            }

            // align -> "left" "center" "right"
            if (columns[i].align) {
                th.style.textAlign = columns[i].align;
            } 

            dfg.append(th);

        }

        root_node.children[this.head_props.deep - rdeep].append( dfg );
    }

    // render for each of col width
    table.prototype.__thead_render_colgroup = function (deep) {
        "use strict";

        this.head_props.deep = deep || this.__get_deep_with("children", this.columns);
        const cols_width = this.head_props.cols_width.section.concat(this.head_props.cols_width.columns);

        let col, w;
        for (let i = 0; i < cols_width.length; ++i) {
            col = this.mem.thead_colgroup.self.children[i];
            w   = cols_width[i];
            if (!col) {
                col =  document.createElement("col");
                this.mem.thead_colgroup.self.appendChild(col);
            }
            if (w > 0) {
                col.style.width = w + "px";
                col.style.minWidth = w + "px";
            } else {
                col.removeAttribute("style");
            }
        }

        // destroy to release memory
        while (this.mem.thead_colgroup.self.children.length > cols_width.length) {
            this.mem.thead_colgroup.self.lastChild.remove();
        }
    }

    // calculated leaf on branch
    table.prototype.__get_leaf_on_branch_by = function(branch_name, columns) {
        "use strict";
        let total = 0;
        for (let i = 0; i < columns.length; ++i) {
            if (columns[i][branch_name]) {
                total += this.__get_leaf_on_branch_by(branch_name, columns[i][branch_name]);
            } else {
                ++total;
            }
        }
        return total
    }

    // calculated deep on tree
    table.prototype.__get_deep_with = function (specified, columns, deep) {
        "use strict";
        const _cur_deep = deep || 1;
        let _ret_deep = _cur_deep;
        columns.forEach(function (el) {
            if (el[specified]) {
                const _deep = this.__get_deep_with(specified, el[specified], _cur_deep + 1);
                if (_deep > _ret_deep) _ret_deep = _deep;
            }
        }, this);

        return _ret_deep;
    }

    // move `thead` to `table2-header`
    // move `table2-header` to `table2-scroll`
    table.prototype.__fixed_header = function () {
        "use strict";

        this.mem.self.classList.add("table2-fixed-header");

        /* set header */
        if (!this.mem.header) {
            this.mem.header = {
                self: document.createElement("div"),
                table: {
                    self: document.createElement("table"),
                    colgroup: {
                        self: this.mem.thead_colgroup.self
                    },
                    thead: {
                        self: this.mem.thead.self
                    }
                },
            }
            this.mem.header.self.classList.add("table2-header");
            this.mem.header.self.appendChild(this.mem.header.table.self);
        }

        // the `tHead` can be null if there's no element of `thead`.
        if (!this.mem.header.table.self.tHead) {
            // dom-tree table pointer to node of this.mem.colgroup.self and this.mem.thead.self
            this.mem.header.table.self.appendChild(this.mem.thead_colgroup.self);
            this.mem.header.table.self.appendChild(this.mem.thead.self);
        }

        /* set scroll */
        if (!this.mem.content.scroll) {
            this.mem.content.scroll = {
                self: document.createElement("div"),
                header: null, body: null
            }
            this.mem.content.scroll.self.classList.add("table2-scroll");

            // tree-dom table2-content pointer to node of table2-scroll
            this.mem.content.self.appendChild(this.mem.content.scroll.self);
        }

        if (!this.mem.content.scroll.header) {
            // dom-tree table2-scroll pointer to node of header and body
            this.mem.content.scroll.self.appendChild(this.mem.header.self);
            this.mem.content.scroll.self.appendChild(this.mem.body.self);
            this.mem.content.scroll.header = this.mem.header;
            this.mem.content.scroll.body = this.mem.body;
        }

        let x = this.__scroll__.x || "",
            y = this.__scroll__.y || "";
        if (typeof x === "number") {
            // table2-header -> table
            this.mem.header.table.self.style.width = x + "px";
            // table2-body -> table
            this.mem.body.table.self.style.width = x + "px";

            this.mem.body.self.style.overflowX = "auto";
        } else if (typeof x === "string") {
            // table2-header -> table
            this.mem.header.table.self.style.width = x;
            // table2-body -> table
            this.mem.body.table.self.style.width = x;

            this.mem.body.self.style.overflowX = "auto";
        } else { // initial to none
            this.mem.header.table.self.style.width = ""; // remove style `width`
            this.mem.body.table.self.style.width = "";   // remove style `width`
            this.mem.body.self.style.overflowX = "";     // remove style `overflow-x`
        }

        if (typeof y === "number") {
            this.mem.body.self.style.maxHeight = y + "px";
            this.mem.body.self.style.overflowY = "scroll";
        } else if (typeof y === "string") {
            this.mem.body.self.style.maxHeight = y;
            this.mem.body.self.style.overflowY = "scroll";
        } else { // initial to none
            this.mem.body.self.style.maxHeight = ""; // remove
            this.mem.body.self.style.overflowY = ""; // remove
        }

    }

    // copy a node of colgroup
    table.prototype.__clone_colgroup = function(from, to_table) {
        "use strict";

        const node = from.cloneNode(true);
        if (to_table.colgroup.self) {
            to_table.colgroup.self.remove();
        }
        to_table.colgroup.self = node;
        // to_table.self.prepend(node);
        to_table.self.insertAdjacentElement("afterbegin", node);
    }

    // init mem mapping
    table.prototype.__init_body = function() {
        "use strict";

        this.mem.body = {
            
            self: document.createElement("div"),

            table: {
                self: document.createElement("table"),
                colgroup: {
                    self: this.mem.thead_colgroup.self.cloneNode(true)
                },
                tbody: {
                    self: document.createElement("tbody"),
                    trs: [], // tbody's tr `{ tr: current_row_dom, tds: [  ]  }`
                    
                    /* event for tbody */
                    listener: {
                        onclick: this.__on_select_row.bind(this),
                        onmouseout: this.__on_mouse_out_row.bind(this),
                        onmouseenter: this.__on_mouse_enter_row.bind(this),
                        onfocus: this.__on_focus_row.bind(this),
                        onblur: this.__on_blur_row.bind(this)
                    }
                }
            },

            /* event for body */
            listener: {
                onscroll: this.__on_scroll.bind(this)
            }
        }

        this.__generator_tbody();

        this.mem.body.table.tbody.self.classList.add("table2-tbody");
        this.mem.tbody = this.mem.body.table.tbody;


        this.mem.body.table.self.appendChild(this.mem.body.table.colgroup.self);
        this.mem.body.table.self.appendChild(this.mem.body.table.tbody.self);

        this.mem.body.self.classList.add("table2-body");
        this.mem.body.self.appendChild(this.mem.body.table.self);

        this.mem.body.self.addEventListener("scroll", this.mem.body.listener.onscroll, false);

    }

    // scroll header by body
    table.prototype.__on_scroll = function(e) {
        "use strict";

        if (e.currentTarget.scrollWidth === e.currentTarget.clientWidth + e.currentTarget.scrollLeft) {
            this.mem.self.classList.remove("table2-scroll-position-left");        
            this.mem.self.classList.remove("table2-scroll-position-middle");        
            this.mem.self.classList.add("table2-scroll-position-right");        
        } else if (e.currentTarget.scrollLeft === 0) {
            this.mem.self.classList.remove("table2-scroll-position-right");        
            this.mem.self.classList.remove("table2-scroll-position-middle");        
            this.mem.self.classList.add("table2-scroll-position-left");        
        } else {
            this.mem.self.classList.remove("table2-scroll-position-left");        
            this.mem.self.classList.remove("table2-scroll-position-right");        
            this.mem.self.classList.add("table2-scroll-position-middle");        
        }

        this.mem.header.self.scrollTo(e.currentTarget.scrollLeft, 0);
    }

    table.prototype.__generator_tbody = function() {
        "use strict";

        // tbody's tr `{ tr: current_row_dom, tds: [  ]  }`
        this.__trs = this.mem.body.table.tbody.trs; // model
        
        // define model properties for rows
        this.__trs._props = {
            listener: {
                onexpand: this.__on_expand.bind(this)
            }
        };  
        // this.__trs._props.on_expand = this.__on_expand.bind(this);
    }


    table.prototype.__set_data_source = function(p_node, data, trs, deep, instruction) {
        "use strict";

        const enqueue = [];
        let ret;
        // `i` index of currently data
        for (let i = 0; i < data.length; ++i) {

            ret = this.__tbody_render_row(data, trs, deep, i, p_node, instruction);

            if (data[i].children && data[i].children.length > 0) {
                if (!trs[i].children) trs[i].children = [];
                if ((instruction & (table.HIDDEN | table.SHOWN)) && ret.expand.self._collapsed) continue;
                enqueue.push({ p_node: ret, data: data[i].children, trs: trs[i].children });
            }

        }

        if ((instruction & table.RENDERED ) && this.defaultExpandAllRows){
            for (let i = 0; i < enqueue.length; ++i) {
                this.__set_data_source(enqueue[i].p_node ,enqueue[i].data, enqueue[i].trs, deep + 1, instruction);
            }
        } else if ( instruction & ( table.SHOWN | table.HIDDEN ) ) {
            instruction |= table.FREEZE_STATUS;
            for (let i = 0; i < enqueue.length; ++i) {
                this.__set_data_source(enqueue[i].p_node ,enqueue[i].data, enqueue[i].trs, deep + 1, instruction);
            }
        }



    }

    // tbody render,
    table.prototype.__tbody_render_row = function (data, trs, deep, index, p_node, instruction) {
        "use strict";

        if (!trs[index]) { // row model, it's key.

            console.assert(data[index].hasOwnProperty("key"), "Each record in dataSource of table should have a unique `key` prop.");
            const key =  data[index].key;
            const row_index = p_node.tr.rowIndex + index + 1;
            trs[index] = {
                tr: this.mem.tbody.self.insertRow(row_index),
                tds: [],
                _props: {
                    key: key,
                    record: data[index],
                    is_indented: false,
                    deep: deep,

                    status: 0
                }
            };
            
            /* add base css style */
            trs[index].tr.classList.add("table2-row");
            trs[index].tr.classList.add("row-level-" + deep);
            
            /* event for row */
            if (this.onFocus) {
                // simulation event for focus.
                trs[index].tr.addEventListener("click", this.mem.body.table.tbody.listener.onfocus, true);
                trs[index].tr.setAttribute("tabindex", "-1");
            } else if (this.onSelect) {
                trs[index].tr.addEventListener("click", this.mem.body.table.tbody.listener.onclick, true);
            }

            if (this.onBlur) {
                trs[index].tr.addEventListener("blur", this.mem.body.table.tbody.listener.onblur, true);
            }

            trs[index].tr.addEventListener("mouseenter", this.mem.body.table.tbody.listener.onmouseenter, false);
            trs[index].tr.addEventListener("mouseout", this.mem.body.table.tbody.listener.onmouseout, false);



            console.assert(!this.__trs._props.rendered_rows.has(key),"Each record in table should have a unique `key` prop.")
            this.__trs._props.rendered_rows.set(key, trs[index]);
            trs[index].tr._props = trs[index]._props; // bind property

        }


        if (trs[index]._props.status === 0) {
            let pos = this.__tbody_render_cell(0, this.columns, data, deep, index, trs);
            if (pos > 0) {
                trs[index]._props.status = table.RENDERED | table.SHOWN;
            }
        }

        if (instruction & table.FREEZE_STATUS) {
            if (instruction & table.SHOWN) {
                trs[index].tr.style.display = "";
            } else if (instruction & table.HIDDEN) {
                trs[index].tr.style.display = "none";
            }
        } else {
            trs[index]._props.status = table.RENDERED | instruction;
            trs[index].tr.style.display = instruction & table.SHOWN ? "" : "none";
        }



        return trs[index];
    }

    // render `td`s in the `tr`
    /*
    column: an item in columns, the columns maybe is columns's children
    position: position: index of cell that will be renders in row
    data: just are records
    deep: row-level-n
    index: index of data and trs
    trs: model for each of row
    */
    table.prototype.__tbody_render_cell = function (position, column,  data, deep, index, trs) {
        "use strict";

        // j: currently column (column.children)
        for (let j = 0; j < column.length; ++j) {

            // first of all... do following
            if (column[j].__mark === this.__columns__.section.__mark) {

                if (this.__columns__.section.mount) {

                    const row = this.__trs._props.rendered_rows.get(trs[index]._props.key),
                        key = trs[index]._props.key;
                    if (!trs[index].section) {
                        const ret = this.__tbody_render_section(key);
                        row.section = ret;
                        trs[index].tr.insertBefore(ret.td, trs[index].tr.cells[position + 1]);
                        trs[index].tds[position] = ret.td;
                    }

                    row.section.checkbox.checked = this.__trs._props.selected_rows.has(key);

                    ++position; // position: index of cell that will be renders in row
                }

            } else if (column[j].hasOwnProperty("children")) {

                // position: index of cell that will be renders in row
                position = this.__tbody_render_cell(position, column[j].children, data, deep, index, trs);

            } else if (column[j].hasOwnProperty("dataIndex")) {
                
                if (trs[index].tr.cells[position]) continue; // nothing...

                const td = trs[index].tr.cells[position] || trs[index].tr.insertCell(position);
                trs[index].tds[position] = td;

                const val = data[index][column[j].dataIndex];

                const obj = {};

                /* custom render... */
                if (column[j].render) {
                    // render(text, record, index);
                    const ret = column[j].render(val, data[index], trs[index].tr.rowIndex);

                    if (ret.constructor === Object) {
                        obj.children = ret.children;
                        obj.props = ret.props;                    
                    } else {
                        obj.children = ret;
                    }
                } else {
                    obj.children = val;
                }
                if (obj.props) {
                    if (obj.props.rowSpan === 0 || obj.props.colSpan === 0) {
                        trs[index].tr.deleteCell(position);
                        // trs[index].tds[position] = null;
                        trs[index].tds.pop();
                        
                        continue; // terminate render in this time
                    }
                    for (let k in obj.props) {
                        td[k] = obj.props[k];
                    } 
                }
                if (obj.children === undefined || obj.children === null) {
                    td.append('');
                } else {
                    td.append(obj.children);
                }

                /* user custom css style, split className by " " */
                if (column[j].className) {
                    column[j].className.split(" ").forEach(function(css) {
                        td.classList.add(css);
                    })
                }


                /* align -> "left" "right" "center" */
                if (column[j].align) {
                    td.style.textAlign = column[j].align;
                }

                /* add indent if dataSource has children */
                if (!trs[index]._props.is_indented) {
                    trs[index]._props.is_indented = true;
                    const row_indent = document.createElement("span");
                    row_indent.classList.add("table2-row-indent");
                    row_indent.classList.add("indent-level-" + deep);
                    row_indent.style.paddingLeft = this.indentSize * deep + "px"; // set indent level
                    if (trs[index].tds[0].classList.contains("table2-selection-column")) {
                        trs[index].tds[1].insertBefore(row_indent, trs[index].tds[1].childNodes[0]); // insert node
                    } else {
                        trs[index].tds[0].insertBefore(row_indent, trs[index].tds[0].childNodes[0]); // insert node
                    }

                    /* add spaced or collapsed or expanded */
                    if (this.__trs._props.is_tree_data) {

                        const expand_icon = document.createElement("span");
                        expand_icon.classList.add("table2-row-expand-icon"); // add base of css class
                        expand_icon.innerHTML = "<i class=\"fa fa-caret-down\"></i><i class=\"fa fa-caret-right\"></i>";

                        if (data[index].children && data[index].children.length > 0) {
                            expand_icon.classList.add("table2-row-collapsed"); // by default, is collapsed
                        } else {
                            expand_icon.classList.add("table2-row-spaced"); // add spaced
                        }

                        expand_icon._props = {
                            key: trs[index]._props.key
                        };
                        expand_icon.addEventListener("click", this.__trs._props.listener.onexpand, false);

                        Object.defineProperty(expand_icon, "_collapsed", {
                            enumerable: false,
                            configurable: false,
                            set: function (collapsed) {
                                if (collapsed) {
                                    this.classList.remove("table2-row-expanded");
                                    this.classList.add("table2-row-collapsed");
                                } else {
                                    this.classList.remove("table2-row-collapsed");
                                    this.classList.add("table2-row-expanded");
                                }
                            },
                            get: function () {
                                return this.classList.contains("table2-row-collapsed");
                            }
                        });

                        trs[index].expand = { self: expand_icon };

                        // expand_icon._props = trs[index]._props;

                        if (this.defaultExpandAllRows) expand_icon._collapsed = false;

                        row_indent.insertAdjacentElement("afterend", expand_icon);
                    }

                }


                ++position;
            }

        }

        return position; // index of cell that will be render in row
    }

    // render section with index of row
    table.prototype.__tbody_render_section = function (key) {
        "use strict";

        if (this.__row_selection__.type === "checkbox") {

            const td = document.createElement("td");
            td.classList.add("table2-selection-column");
            // td.__mark = this.__columns__.section.__mark;

            const checkbox = new table.__checkbox(td,
                {
                    onChange: this.__checkbox_change
                });
            // checkbox.__row_index = row_index;
            checkbox.__key = key;
            checkbox.__super__ = this;

            const section = {
                td: td,
                checkbox: checkbox
            }

            return section;
        }
    }

    // change padding in `td`
    table.prototype.__set_size = function () {
        "use strict";

        this.mem.self.classList.remove("table2-small");
        this.mem.self.classList.remove("table2-middle");
        this.mem.self.classList.remove("table2-lager");

        if (this.__size__ === "middle") {
            this.mem.self.classList.add("table2-middle");
        } else if (this.__size__ === "small") {
            this.mem.self.classList.add("table2-small");
        } else if (this.__size__ === "lager") {
            this.mem.self.classList.add("table2-lager");
        } else {
            this.mem.self.classList.add("table2-default");
        }
    }


    table.prototype.__set_border = function () {
        "use strict";
        if (this.__bordered__) {
            this.mem.self.classList.add("table2-bordered");
        } else {
            this.mem.self.classList.remove("table2-bordered");
        }
    }

    // mount or unmount section
    table.prototype.__set_row_selection = function() {
        "use strict";

        const section = this.__columns__.section,  // section for thead
            rows    = this.__trs._props.rendered_rows;  // for tbody

        if (!section.mount) { 
            
            this.head_props.cols_width.section.pop();
            this.__thead_render_colgroup(this.head_props.deep); // render by `cols_width`

            if (this.scroll) { // fixed header
                this.__clone_colgroup(this.mem.thead_colgroup.self, this.mem.body.table);
            }

            // rm th in thead and holds it's nextSibling to `next_node`
            section.next_node = section.th.nextSibling;
            section.th.remove();

            // rm td in tbody and holds it's nextSibling to `next_node`
            for (let [k, v] of rows) {
                v.section.next_node = v.section.td.nextSibling;
                v.section.td.remove();
            }

        } else { // to mount section

            this.head_props.cols_width.section[0] = 0;
            this.__thead_render_colgroup(this.head_props.deep); // render by `cols_width`

            if (this.scroll) { // fixed header
                this.__clone_colgroup(this.mem.thead_colgroup.self, this.mem.body.table);
            }

            if (section.th) {
                // recover section(checkbox or radio) to parent node tr.
                section.next_node.insertAdjacentElement('beforebegin', section.th);
            } else {
                this.__generator_thead();
            }

            // recover section(checkbox or radio) for tbody.
            for (let [k, v] of rows) {
                if (!v.section) {
                    v.section = this.__tbody_render_section(k);
                    let i = 0;
                    for (; i < v.tds.length; ++i) {
                        if (v.tds[i].className === "") break;
                    }
                    v.tds[i].insertAdjacentElement('beforebegin', v.section.td);                
                    v.tds.splice(i, 0, v.section.td);
                } else {
                    v.section.next_node.insertAdjacentElement('beforebegin', v.section.td);
                }
            }

        }
    }


    // set columns for section
    table.prototype.__set_columns_for_extended = function(mounted) {
        "use strict";

        let mark;
        this.__columns__.section.mount = mounted;
        if (this.__columns__.section.__mark === null) {
            mark = Date.now();
            this.__columns__.section.__mark = mark;
        }

        if (!this.__columns__.section.columns) {
            this.__columns__.section.columns = [{
                __mark: mark,
                type: this.rowSelection.type
            }];
        }
    }

    // select all checkbox manually
    table.prototype.__checkbox_change_all = function(e) {
        "use strict";

        const checked = e.target.checked;
        const last_a = this.__row_selection__.selectedRowKeys;
        const last_m = {}, changed_a = [];
        for (let i = 0; i < last_a.length; ++i) {
            last_m[last_a[i]] = this.__trs._props.all_rows.get(last_a[i]);
        }

        this.__row_selection__.selectedRowKeys = [];
        if (checked) {
            for (let [k, v] of this.__trs._props.all_rows) {
                this.__row_selection__.selectedRowKeys.push(k);
                if (!last_m[k]) changed_a.push(v);
            }
        } else {
            for (let [k, v] of this.__trs._props.all_rows) {
                changed_a.push(v);
            }
        }



        this.__set_selected_rows_keys(this.__row_selection__.selectedRowKeys);

        if (this.__row_selection__.onSelectAll) {
            // select all manually
            this.__row_selection__.onSelectAll(checked, this.__row_selection__.selectedRows, changed_a);
        }
      
    }


    table.prototype.__checkbox_change = function(e) {
        "use strict";

        let row_selection, _this; // _this -> obj of table


        // in this case indicates `event change`
        _this = this.__super__;
        row_selection = this.__super__.__row_selection__;
        const row = _this.__trs._props.rendered_rows.get(this.__key);

        if (e.target.checked) {
            row_selection.selectedRowKeys.push(this.__key);
        } else {
            row_selection.selectedRowKeys = row_selection.selectedRowKeys.filter(function (key) {
                return key !== this.__key;
            }, this);
        }


        for (let i = 0; i < row_selection.selectedRowKeys.length; ++i) {
            row_selection.selectedRows[i] = _this.__trs._props.all_rows.get(row_selection.selectedRowKeys[i]);
        }
        while (row_selection.selectedRows.length > row_selection.selectedRowKeys.length) {
            row_selection.selectedRows.pop();
        }

        if (row_selection.onChange) { // the callback that selected's has been changed.
            row_selection.onChange(row_selection.selectedRowKeys, row_selection.selectedRows);
        }

        if (row_selection.onSelect) { // the callback that user selected/unselected one row manually.
            row_selection.onSelect(row._props.record, e.target.checked, row_selection.selectedRows, e);
        }

        _this.__set_selected_rows_keys(row_selection.selectedRowKeys, row_selection.selectedRows);

    }


    table.prototype.__set_selected_rows_keys = function(keys) {
        "use strict";

        console.assert(keys.constructor === Array);

        this.__row_selection__.selectedRowKeys = keys; // selected keys
        const props = this.__trs._props;
        props.selected_rows.clear();
        let record;
        for (let i = 0; i < keys.length; ++i) {
            record = props.all_rows.get(keys[i]);
            props.selected_rows.set(keys[i], record);
            this.__row_selection__.selectedRows[i] = record;
        }

        while (this.__row_selection__.selectedRows.length > keys.length) {
            this.__row_selection__.selectedRows.pop();
        }

        // selection for thead
        if (this.__row_selection__.selectedRowKeys.length === this.__trs._props.all_rows.size) {
            this.__columns__.section.checkbox.checked = true;
            this.__columns__.section.checkbox.indeterminate = false;
        } else if (this.__row_selection__.selectedRowKeys.length === 0) {
            this.__columns__.section.checkbox.checked = false;
            this.__columns__.section.checkbox.indeterminate = false;
        } else {
            this.__columns__.section.checkbox.checked = false;
            this.__columns__.section.checkbox.indeterminate = true;
        }

        /* update UI */
        for (let [k, v] of this.__trs._props.rendered_rows) {
            v.section.checkbox.checked = props.selected_rows.has(k);
        }

    };

    // click a row
    // event type of click
    table.prototype.__on_select_row = function(e) {
        "use strict";

        let section_column, skip = 0;

        e._props = e.currentTarget._props;
        let row_model;

        for (let i = 0; i < e.path.length; ++i) {

            // insides checkbox or radio
            if (e.path[i].classList.contains("table2-selection-column") && !section_column) {
                section_column = e.path[i];
            }

            // tree structure for records
            if (e.path[i].classList.contains("table2-row-expand-icon")) {
                skip = 1;
                break;
            }

            /* row select */
            if (e.path[i].classList.contains("table2-row")) {
                if ( section_column && (section_column === this.__trs._props.rendered_rows.get(e._props.key).section.td) ) {
                    skip = 1;
                    break;
                }

                /* onfocus */
                if (e._type === "focus") {
                    e.currentTarget.focus();
                    break;
                }

                /* onclick */
                for (let [key, value] of this.__trs._props.rendered_rows) {
                    if (value.tr.classList.contains("table2-select")) {
                        value.tr.classList.remove("table2-select");
                        break;
                    }
                }
                row_model = this.__trs._props.rendered_rows.get(e._props.key);
                row_model.tr.classList.add("table2-select");

                break;
            }
        }

        // additional callback different from ant-design.
        if (!skip && this.onFocus) {  // onfocus has a high priority
            this.onFocus(e._props.record);
        } else if (!skip && this.onSelect) {
            this.onSelect(e._props.record);
        }
    }

    // event of focus and blur
    table.prototype.__on_focus_row = function(e) {
        e._type = "focus";
        this.__on_select_row(e);
    }
    table.prototype.__on_blur_row = function(e) {
        this.onBlur(e.currentTarget._props.record);
    }


    // event of hover
    table.prototype.__on_mouse_enter_row = function(e) {
        e.currentTarget.classList.add("table2-row-hover");
    }
    table.prototype.__on_mouse_out_row = function(e) {
        e.currentTarget.classList.remove("table2-row-hover");    
    }


    // sort function impl
    table.prototype.__generator_sorter = function (column) {
        "use strict";

        const sorter = document.createElement("div"),
            up     = document.createElement("span"),
            down   = document.createElement("span"),
            i_up   = document.createElement("i"),
            i_down = document.createElement("i");

        sorter.classList.add("table2-column-sorter");
        up.classList.add("table2-column-sorter-up");
        down.classList.add("table2-column-sorter-down");
        i_up.className = "fa fa-caret-up";
        i_down.className = "fa fa-caret-down";

        up.title = "↑";
        down.title = "↓";

        up.append(i_up);
        down.append(i_down);

        sorter.append(up);
        sorter.append(down);

        // init
        sorter._props = {
            column: column,
            field: column.dataIndex,
            columnKey: column.key || column.dataIndex,
            order: false              // current sorting state, after via `click event`
        }


        sorter._this = this;

        sorter.addEventListener("click", function(e) {
            "use strict";

            let is_sorted = true;

            /* switch state */
            if (e.target.title === "↑") {

                if (this._props.order === "ascend") {
                    is_sorted = false;
                    this._props.order = false;
                } else {
                    this._props.order = "ascend";
                }

                this.children[1].classList.add("off");
                this.children[1].classList.remove("on");

                if (is_sorted) {
                    this.children[0].classList.add("on");
                    this.children[0].classList.remove("off");
                } else {
                    this.children[0].classList.remove("on");
                    this.children[0].classList.add("off");
                }

            } else if (e.target.title === "↓") {

                if (this._props.order === "descend") {
                    is_sorted = false;
                    this._props.order = false;                    
                } else {
                    this._props.order = "descend";
                }

                this.children[0].classList.add("off");
                this.children[0].classList.remove("on");

                if (is_sorted) {
                    this.children[1].classList.add("on");
                    this.children[1].classList.remove("off");
                } else {
                    this.children[1].classList.remove("on");
                    this.children[1].classList.add("off");
                }
            }

            // callback `inside event`
            this._this.__on_change.apply(this._this, [null, null, is_sorted ? this._props : null]);
        }, false); // use bubble.

        return sorter;
    }

    //
    table.prototype.__on_change = function(pagination, filters, sorter) {
        "use strict";

        if (this.onChange) {
            this.onChange(pagination || {}, filters || {}, sorter || {});
        }
    }

    //
    table.prototype.__generator_expand = function() {
        "use strict";

        const expand_icon = document.createElement("span");
        expand_icon.classList.add("table2-row-expand-icon"); // add base css class
        return expand_icon;
    }

    table.prototype.__on_expand = function(e) {
        "use strict";

        const p_node = this.__trs._props.rendered_rows.get(e.currentTarget._props.key);

        if (e.currentTarget._collapsed) {
            /* expanded */
            e.currentTarget._collapsed = false;

            // `deep` needs +1
            this.__set_data_source(p_node, p_node._props.record.children, p_node.children, p_node._props.deep + 1, table.SHOWN);
        } else {
            /* collapsed */
            e.currentTarget._collapsed = true;

            this.__set_data_source(p_node, p_node._props.record.children, p_node.children, p_node._props.deep + 1, table.HIDDEN);
        }

    }

    return table;
})();

