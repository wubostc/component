"use strict";

console.assert(Map);

/**
 *
 * @param {DOM} table_container
 * @param {Object} opt
 *       {
 *         {Object} head: {
 *                  {Array} colfuncs
 *                      [ func, ... ]
 *                      {callback} func
 *                          @param column of tbody
 *                          @param event
 *                }
 *
 *          {Object} body: {
 *                   {function} rowfuncs
 *                       @param
 *
 *                 }
 *
 *          {Array} w
 *               [ width, ... ]
 *                  {string} width
 *                  e.g. [ "123.5px", "300px", "123*", "66*" ]
 *                  px 固定的宽
 *                  * 自动缩放
 *       }
 */
function table (  table_container, opt  ) {
    if (!table.pool) {
        table.pool = new Map();
    }
    if (table.pool.has(table_container)) {
        return table.pool.get(table_container);
    } else {
        table.pool.set(table_container, this);
    }

    this.w = null;
    // this.h = [];

    this.head = {
        rowfunc: null,
        colfuncs: null
    };

    this.body = {
        rowfuncs: null,
        colfuncs: null
    };

    this.__colarr = null;

    if (opt) {
        if (opt.head) {
            if (opt.head.colfuncs) {
                this.head.colfuncs = opt.head.colfuncs;
            }
        }
        if (opt.body) {
            if (opt.body.rowfuncs) {
                this.body.rowfuncs = opt.body.rowfuncs;
            }
        }
        if (opt.w) {
            this.w = opt.w;
        }
        // if (opt.h) {
        //     // this.h = opt.h;
        // }
    }

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

    this.create(opt);
}

table.prototype.__init = function(c) {

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
            row: tbody.children
        },
        __styletemplate: document.createElement("style")
    };

    this.mem.root.appendChild(this.mem.__styletemplate);
    this.mem.root.classList.add(this.style.root_class);

    // if (this.head.colfuncs) {
    //     Array.prototype.forEach.call(this.mem.head.cols, function (el, idx) {
    //         if (this.head.colfuncs[idx]) {
    //             el.addEventListener("click", this.__headcolfunc.bind(this), false);
    //         }
    //     }, this);
    // }
    this.__addEventListener();

    this.mem.root.setAttribute("tableid", this.gid);

    window.addEventListener("resize", this.__resize.bind(this), false);

    if (this.w) {
        this.generateStyle();
    }
};

/**
 * 添加、删除和更新时要调用
 *
 * @param {Object} opt
 */
table.prototype.create = function(opt) {
    let rows = this.mem.body.root.children; // rows of tbody

    if (rows.length === 0) {
        this.mem.table.classList.add(this.style.empty_class);
    } else if (rows.length > 0) {
        this.mem.table.classList.remove(this.style.empty_class);
        for (let i = 0; i < rows.length; ++i) {
            rows[i].setAttribute("tabindex", -1);
            rows[i].addEventListener("click", this.__tbodyrowclick.bind(this), false);
            rows[i].addEventListener("blur", this.__tbodyrowblur.bind(this), false);

            Array.prototype.forEach.call(rows[i].children, function (ele) {
                ele.title = ele.innerText;
            });
        }
    }
    this.__resize();

    this.__remap();


};

/**
 *
 * @param {Object} colobj
 *     { innerHTML: "addedcol", colfunc:function(col,e){}, w: "33*"  }
 *
 *
 * @param {uint} insertpos
 *      1 表示插入第一列，原先第一列变成第二列
 *      undefined 默认插入最后一列
 */
table.prototype.addCol = function(colobj,insertpos) {

    if (insertpos !== undefined) {
        console.assert(insertpos > 0 && insertpos <= this.w.length + 1, "inserpos: ", insertpos);
        insertpos = Math.max(1, Math.min(insertpos, this.w.length + 1));
    }

    this.w.splice(insertpos - 1, 0, colobj.w);
    //todo...
    this.head.colfuncs.splice(insertpos - 1, 0, colobj.colfunc);
    this.generateStyle();

    let docfrag = document.createDocumentFragment();

    let th = document.createElement("div");
    th.classList.add(this.style.thead_cell_class);
    th.innerHTML = colobj.innerHTML;

    // insert to col of head
    let cols = this.mem.head.row.children.length;
    docfrag.appendChild(th);
    this.mem.head.row.appendChild(docfrag);
    for (let i = 0; i < cols + 1 - insertpos; ++i) {
        this.mem.head.row.appendChild(this.mem.head.row.children[insertpos - 1]);
    }

    // insert to col of body
    let rows = this.mem.body.root.children.length;
    for (let i = 0; i < rows; ++i) {
        let td = document.createElement("div");
        td.classList.add(this.style.tbody_cell_class);
        docfrag.appendChild(td);
        this.mem.body.row[i].appendChild(docfrag);

        for (let j = 0; j < cols + 1 - insertpos; ++j) {
            this.mem.body.row[i].appendChild(this.mem.body.row[i].children[insertpos - 1]);
        }
    }

    this.__remap();

    this.__addEventListener();

    return this.__colarr[insertpos - 1];
};

/**
 *
 * @param colpos
 */
table.prototype.removeCol = function(colpos) {

};


table.prototype.hideCol = function (colpos) {
    console.assert(colpos > 0 && colpos <= this.w.length + 1, "colpos: ", colpos);
    colpos = Math.max(1, Math.min(colpos, this.w.length + 1));

    this.generateStyle("display:none;", colpos);
};

table.prototype.showCol = function (colpos) {
    console.assert(colpos > 0 && colpos <= this.w.length + 1, "colpos: ", colpos);
    colpos = Math.max(1, Math.min(colpos, this.w.length + 1));

    this.generateStyle("display:unset;", colpos);
};

/**
 * 表身行回调
 * @param e
 */
table.prototype.__tbodyrowclick = function(e) {
    if (this.prevselected_row) {
        this.prevselected_row.classList.remove(this.style.tbody_row_select_class);
    }
    this.currselected_row = e.currentTarget;
    this.prevselected_row = e.currentTarget;

    this.currselected_row.classList.add(this.style.tbody_row_select_class);

    if (this.body.rowfuncs) {
        this.body.rowfuncs(e.currentTarget,e);
    }
};


table.prototype.__tbodyrowblur = function (e) {
    //this.prevselected_row.classList.remove(this.style.tbody_row_select_class);
};

/**
 * 表头列回调
 * @param e
 *
 */
table.prototype.__headcolfunc = function(e) {
    Array.prototype.find.call(this.mem.head.cols, function(el, idx) {
        if (e.currentTarget === el) {
            this.head.colfuncs[idx](this.__colarr[idx], e);
            return true;
        }
    }, this);
};


/**
 * resize after update table or window.resize
 */
table.prototype.__resize = function(e) {
    /* auto match width */
    this.mem.head.root.style.width = "";

    let basew = 0;
    if (this.mem.body.root.children.length > 0) {
        basew = this.mem.body.row[0].clientWidth;
    }

    if (basew === 0) return;

    // fixed width of thead
    this.mem.head.root.style.width = basew + "px";
};

table.prototype.__remap = function () {
    this.__colarr = [];
    Array.prototype.forEach.call(this.mem.body.row, function(el, i) {
        for (let i2 = 0; i2 < this.mem.body.row[i].children.length; ++i2) {
            if (!this.__colarr[i2]) {
                this.__colarr[i2] = [];
            }

            this.__colarr[i2][i] = this.mem.body.row[i].children[i2];
        }
    }, this);
};

table.prototype.__addEventListener = function () {
    if (this.head.colfuncs) {
        Array.prototype.forEach.call(this.mem.head.cols, function (el, idx) {
            if (this.head.colfuncs[idx]) {
                el.addEventListener("click", this.__headcolfunc.bind(this), false);
            }
        }, this);
    }
}

table.prototype.generateStyle = function (addtionstyle, colpos) {
    if (!this.w) return;
    var stylestrbuff="";
    var csspropsstr = "";
    this.w.forEach(function(width, i) {
        if (width.indexOf("*") > 0) {  // "100*" 自动缩放 100为最小宽度100px
            csspropsstr = "width:" + (parseFloat(width)) + "px;";
        } else if (width.indexOf("px") > 0) {  // "29px" 固定宽度
            csspropsstr = "width:" + parseFloat(width) + "px;flex-grow: 0;";
        }

        if (i === colpos - 1) {
            csspropsstr += addtionstyle;
        }

        stylestrbuff += "[tableid='" + this.gid + "'] .row .cell:nth-of-type(" + (i + 1) + "){" + csspropsstr + "}";
    }, this);
    this.__styletemplate = stylestrbuff;
    this.mem.__styletemplate.innerText = stylestrbuff;
};

table.GID = function () {

    return (Math.random()).toString(16).slice(2);
};