
"use strict";


function Dialog(dialog_container, opt) {



    if (!Dialog.pool) {
        Dialog.pool = new Map();
    }
    if (Dialog.pool.has(dialog_container)) {
        return Dialog.pool.get(dialog_container);
    } else {
        Dialog.pool.set(dialog_container, this);
    }


    this.props = { };

    this.style = {
        root_class: "dialog-container",
        hidden_class: "dialog-hidden",
        // mask layer
        mask_class: "dialog-mask",
        mask_enter_class: "dialog-mask-enter",
        mask_leave_class: "dialog-mask-leave",
        mask_hidden_class: "dialog-mask-hidden",

        dialog_class: "dialog",
        dialog_enter_class: "dialog-enter",
        dialog_leave_class: "dialog-leave",
        dialog_modeless_class: "dialog-modeless",
        dialog_modal_class: "dialog-modal",
        dialog_titlebtns_class: "dialog-titlebtns",
        dialog_header_class: "dialog-header",
        dialog_title_class: "dialog-title",
        dialog_close_class: "dialog-close",
        dialog_min_class: "dialog-min",
        dialog_max_class: "dialog-max",
        dialog_main_class: "dialog-main",
        dialog_content_class: "dialog-content",
        dialog_main_icon_class: "dialog-main-icon",
        dialog_footer_class: "dialog-footer"
    };


    this.gid = Dialog.GID();

    this.onshow = opt.onshow || null;
    this.onhide = opt.onhide || null;
    this.onshown = opt.onshown || null;
    this.onhidden = opt.onhidden || null;
    this.onblur = opt.onblur || null;
    this.onfocus = opt.onfocus || null;

    this.modal = opt.hasOwnProperty("modal") ? opt.modal : false;
    this.closeable = opt.hasOwnProperty("closeable") ? opt.closeable : true;
    // this.minable = opt.hasOwnProperty("minable")   ? opt.minable   : false;
    // this.restoreable = opt.hasOwnProperty("restoreable")   ? opt.restoreable : false;
    this.minable = false;
    this.restoreable = false;
    this.title = opt.hasOwnProperty("title") ? opt.title : "&nbsp;";

    this.buttons = opt.buttons ? opt.buttons : [];
    this.__setFooter(opt);

    this.props.w = opt.hasOwnProperty("w") ? opt.w : "";
    this.props.h = opt.hasOwnProperty("h") ? opt.h : "";
    this.generateStyle();
    this.props.draggable = opt.hasOwnProperty("draggable") ? opt.draggable : true;
    this.props.feedback = opt.hasOwnProperty("feedback") ? opt.feedback : "";  // main icon
    this.props.type = opt.hasOwnProperty("type") ? opt.type : "";              // header color
    this.props.top = opt.hasOwnProperty("top") ? opt.top : "40%";
    this.props.left = opt.hasOwnProperty("left") ? opt.left : "50%";
    this.setPos([this.props.left, this.props.top], true);
    this.__startprecent = [this.props.left, this.props.top];
    this.setAnchor(opt.hasOwnProperty("anchor") ? opt.anchor : [0.5, 0.5], true);

    this.props.animate = opt.hasOwnProperty("animate") ? opt.animate : Dialog.ANIMATE_DEFAULT;
    this.setAnimate(this.props.animate);

    this.props.zIndex = opt.hasOwnProperty("zIndex") ? opt.zIndex : null;


    this.__styletemplate = "";

    this.generateStyle();

    this.__init(dialog_container);

    this.create(opt);

    this.__setContent(opt);
}

Dialog.prototype.__init = function(dom_c,opt) {
    let _this = this;
    this.mem = {
        root: dom_c,
        mask: document.createElement("div"),
        dialog: document.createElement("div"),
        dialog_header: {
            root: document.createElement("div"),
            title: document.createElement("div"),
            btns: {
                root: document.createElement("div"),
                min: null,
                restore: null,
                close: null
            }
        },
        dialog_main: {
            root: document.createElement("div"),
            content: document.createElement("div")
        },
        dialog_footer: {
            root: null
        }
    };

    /* style */
    if (this.__styletemplate !== "") {
        this.mem.__styletemplate = document.createElement("style");
        this.mem.__styletemplate.innerText = this.__styletemplate;
    }

    /* mask */
    this.mem.mask.classList.add(this.style.mask_class);
    this.mem.mask.classList.add(this.style.mask_hidden_class);  // hides it by default

    /* header */
    this.mem.dialog_header.root.classList.add(this.style.dialog_header_class);
    this.mem.dialog_header.title.classList.add(this.style.dialog_title_class);
    this.mem.dialog_header.btns.root.classList.add(this.style.dialog_titlebtns_class);

    if (this.restoreable) {
        this.mem.dialog_header.btns.restore = document.createElement("div");
        this.mem.dialog_header.btns.restore.classList.add(this.style.dialog_max_class);
        this.mem.dialog_header.btns.root.appendChild(this.mem.dialog_header.btns.restore);
    }

    if (this.minable) {
        this.mem.dialog_header.btns.min = document.createElement("div");
        this.mem.dialog_header.btns.min.classList.add(this.style.dialog_min_class);
        this.mem.dialog_header.btns.root.appendChild(this.mem.dialog_header.btns.min);
    }

    if (this.closeable) {
        this.mem.dialog_header.btns.close = document.createElement("div");
        this.mem.dialog_header.btns.close.classList.add(this.style.dialog_close_class);
        this.mem.dialog_header.btns.root.appendChild(this.mem.dialog_header.btns.close);
        this.mem.dialog_header.btns.close.onclick = function (e) {
            _this.close();
        }
    }

    if (this.props.type) {
        this.mem.dialog_header.root.classList.add(this.props.type);
    }

    this.mem.dialog_header.root.appendChild(this.mem.dialog_header.title);
    this.mem.dialog_header.root.appendChild(this.mem.dialog_header.btns.root);


    /* main */
    if (this.props.feedback !== "") {
        let fb = document.createElement("div");
        fb.classList.add(this.style.dialog_main_icon_class);
        this.mem.dialog_main.root.appendChild(fb);
        let s = document.createElement("div");
        s.classList.add(this.props.feedback);
        fb.appendChild(s);
    }
    this.mem.dialog_main.content.classList.add(this.style.dialog_content_class);
    this.mem.dialog_main.root.appendChild(this.mem.dialog_main.content);
    this.mem.dialog_main.root.classList.add(this.style.dialog_main_class);

    /* footer */
    if (this.buttons.length > 0) {
        this.mem.dialog_footer.root = document.createElement("div");
        this.mem.dialog_footer.root.classList.add(this.style.dialog_footer_class);
        this.__addFooterButtons();
    }


    /* dialog */
    this.mem.dialog.classList.add(this.style.dialog_class);
    this.mem.dialog.classList.add(this.modal ? this.style.dialog_modal_class : this.style.dialog_modeless_class);
    this.mem.dialog.appendChild(this.mem.dialog_header.root);
    this.mem.dialog.appendChild(this.mem.dialog_main.root);
    if (this.buttons.length > 0) {
        this.mem.dialog.appendChild(this.mem.dialog_footer.root);
    }
    if (this.props.zIndex >= 0) {
        this.mem.dialog.style.zIndex = this.props.zIndex;
    }

    /* container */
    this.mem.root.classList.add(this.style.root_class);
    this.mem.root.classList.add(this.style.hidden_class); // hides it by default
    this.mem.root.appendChild(this.mem.mask);
    this.mem.root.appendChild(this.mem.dialog);
    if (this.mem.__styletemplate) {
        this.mem.root.appendChild(this.mem.__styletemplate);
    }

    this.mem.root.setAttribute("dialogid", this.gid);

    if (this.props.draggable) {
        this.mem.dialog_header.root.setAttribute("draggable", "" + this.props.draggable);
        this.mem.dialog_header.root.addEventListener("dragstart", this.__ondragstart.bind(this), false);
        this.mem.dialog_header.root.addEventListener("drag", this.__ondrag.bind(this), false);
        this.mem.dialog_header.root.addEventListener("dragend", this.__ondragend.bind(this), false);
    }

    if (navigator.userAgent.indexOf("Trident") !== -1) { //  IE

    } else {

    }

    this.mem.dialog.setAttribute("tabindex", "-1"); // for onfocus onblur onkeypress
    this.mem.dialog.addEventListener("focus", function (e) {
        _this.__onfocus(e);
    });
    this.mem.dialog.addEventListener("blur", function (e) {
        _this.__onblur(e);
    });
    this.mem.dialog.addEventListener("keypress", function (e) {
        _this.buttons.forEach(function (el) {
            if (el.hotkey === e.keyCode && el.action) {
                el.action(_this,e);
            }
        });

        if (e.target === _this.mem.dialog && e.key === 'q') {
            _this.close();
        }
    });

    this.mem.dialog.addEventListener("animationend", function (e) {
        if (e.srcElement === _this.mem.dialog) {
            if (!_this.visible) {    /* hidden */
                _this.mem.root.classList.add(_this.style.hidden_class);
                _this.__onhidden(e);
            } else {                /* shown */
                _this.__onshown(e);
                _this.mem.dialog.focus();
            }
        }
    });

    this.mem.dialog.addEventListener("animationstart", function (e) {
        if (e.srcElement === _this.mem.dialog) {

        }
    });

};

/**
 * call this func before open this dialog
 */
Dialog.prototype.__onshow = function (e) {
    if (this.onshow) {
        this.onshow(this,e);
    }
};

/**
 * call this func before close this dialog
 */
Dialog.prototype.__onhide = function (e) {
    if (this.onhide) {
        this.onhide(this,e);
    }
};

/**
 * call this func after open this dialog
 */
Dialog.prototype.__onshown = function (e) {
    if (this.onshown) {
        this.onshown(this,e);
    }
};

/**
 * call this func after close this dialog
 */
Dialog.prototype.__onhidden = function (e) {
    if (this.onhidden) {
        this.onhidden(this,e);
    }
};

Dialog.prototype.__ondragstart = function(e) {

    this.__startpos = [e.clientX, e.clientY];
    this.__startprecent = [this.props.dynleft, this.props.dyntop];
};

/**
 * x, y 按百分比来算
 */
Dialog.prototype.__ondrag = function (e) {

    if (e.clientX > 0 || e.clientY > 0) {
        let x = (e.clientX - this.__startpos[0]) / window.innerWidth * 100  + this.__startprecent[0];
        let y = (e.clientY - this.__startpos[1]) / window.innerHeight * 100 + this.__startprecent[1];
        this.setPos([x, y]);
    }
};

Dialog.prototype.__ondragend = function (e) {

};

Dialog.prototype.__onfocus = function (e) {
    this.mem.dialog.classList.add("active");
    if (this.onfocus) {
        this.onfocus(this,e);
    }

};

Dialog.prototype.__onblur = function (e) {
    this.mem.dialog.classList.remove("active");
    if (this.onblur) {
        this.onblur(this, e);
    }
};

/**
 *
 * @param {bool|array} animate
 *      true: will be ignore, use default
 *      false: don't play
 *      array: css class
 *           [_1, _2, _3, _4]
 *           _1: dialog enter
 *           _2: dialog leave
 *           _3: mask enter
 *           _4: mask leave
 */
Dialog.prototype.setAnimate = function (animate) {
    if (animate === false) {
        /*  just a placeholder... */
        this.style.dialog_enter_class = "_1";
        this.style.dialog_leave_class = "_2";
        this.style.mask_enter_class = "_3";
        this.style.mask_leave_class = "_4";
    } else {
        this.style.dialog_enter_class = this.props.animate[0];
        this.style.dialog_leave_class = this.props.animate[1];
        this.style.mask_enter_class = this.props.animate[2];
        this.style.mask_leave_class = this.props.animate[3];
    }
};

/**
 * 设置锚点
 * @param {Array} pos
 *     [0.5, 0.5] default      [0.5, 0]            [0.25, 0.8]
 *         ----------------    -------*--------    ----------------
 *         |              |    |              |    |              |
 *         |              |    |              |    |              |
 *         |       *      |    |              |    |              |
 *         |              |    |              |    |              |
 *         |              |    |              |    |   *          |
 *         ----------------    ----------------    ----------------
 * @param {bool} withoutrender
 *         不重绘dialog
 *
 * @return {null|array}
 *          array: 上次设置的锚点
 */
Dialog.prototype.setAnchor = function (pos, withoutrender) {
    let prev = null;
    if (pos instanceof Array) {
        prev = this.props.anchor;
        this.props.anchor = pos;

        if (!withoutrender) {
            this.render();
        }
    }
    return prev;
};

/**
 *
 * @param {string|float} a
 *     e.g. "400px"  "30%"  3455
 * @param {float} b
 * @return {float}
 * @private
 */
Dialog.__conv2precent = function (a, b) {
    if (typeof a === "number") {
        return a;
    }

    if (a.lastIndexOf("%") > 1) {
        return parseFloat(a);
    } else if (a.lastIndexOf("px") > 1) {
        return parseFloat(a) / b * 100;
    }
};

/**
 * 设置dialog在浏览器中的位置
 *
 * @param {array} pos
 *        e.g.  [45.5, 50]  ["45.5%", "50%"]  ["900px", "500px]
 *
 * @param {bool} withoutrender
 *      是否重绘dialog
 *
 */
Dialog.prototype.setPos = function (pos, withoutrender) {

    this.props.dynleft = Dialog.__conv2precent(pos[0],  window.innerWidth);
    this.props.dyntop = Dialog.__conv2precent(pos[1],  window.innerHeight);

    if (!withoutrender) {
        this.render();
    }
};

/**
 *
 * @return { [precent,precent] }
 */
Dialog.prototype.getPos = function () {
    return [this.props.left, this.props.top];
};


Dialog.prototype.render = function () {
    this.mem.dialog.style.left = "calc(" + this.props.dynleft + "% - " + (this.mem.dialog.clientWidth * parseFloat(this.props.anchor[0])) + "px)";
    this.mem.dialog.style.top = "calc(" + this.props.dyntop + "% - " + (this.mem.dialog.clientHeight * parseFloat(this.props.anchor[1])) + "px)";
};


/**
 *
 * @param {Object} opt
 */
Dialog.prototype.create = function() {

    this.setTitle();

};


Dialog.prototype.open = function () {
    if (this.visible) return;

    this.mem.dialog.classList.remove(this.style.dialog_leave_class);
    this.mem.dialog.classList.add(this.style.dialog_enter_class);

    if (this.modal) {
        // mask layer
        this.mem.mask.classList.remove(this.style.mask_hidden_class);
        this.mem.mask.classList.remove(this.style.mask_leave_class);
        this.mem.mask.classList.add(this.style.mask_enter_class);
    } else {
        // mask layer
        this.mem.mask.classList.add(this.style.mask_hidden_class);
    }

    this.__onshow();

    this.mem.root.classList.remove(this.style.hidden_class);
    this.mem.root.style.display = "";
    this.setPos([this.props.left, this.props.top]);

    if (!this.props.animate) {
        this.__onshown();
        this.mem.dialog.focus();
    }


    this.visible = true;
};



Dialog.prototype.close = function () {

    this.mem.dialog.classList.remove(this.style.dialog_enter_class);
    this.mem.dialog.classList.add(this.style.dialog_leave_class);

    this.mem.mask.classList.remove(this.style.mask_enter_class);
    this.mem.mask.classList.add(this.style.mask_leave_class);


    this.visible = false;



    this.__onhide();

    if (!this.props.animate) {
        this.mem.root.classList.add(this.style.hidden_class);
        this.mem.root.style.display = "";

        this.__onhidden();
    }

};



Dialog.prototype.generateStyle = function (additional) {
    let stylebuff = "";

    if (this.props.hasOwnProperty("w")) {
        if (this.props.w.indexOf("*") > 0) {
            stylebuff += "[Dialogid='" + this.gid + "'] .dialog{";
            stylebuff += "min-width:" + parseFloat(this.props.w) + "px;";
            stylebuff += "}";
        } else if (this.props.w.indexOf("px") > 0) {
            stylebuff += "[Dialogid='" + this.gid + "'] .dialog{";
            stylebuff += "width:" + parseFloat(this.props.w) + "px;";
            stylebuff += "}";
        }
    }

    if (this.props.hasOwnProperty("h")) {
        if (this.props.h.indexOf("*") > 0) {
            stylebuff += "[Dialogid='" + this.gid + "'] .dialog{";
            stylebuff += "min-height:" + parseFloat(this.props.h) + "px;";
            stylebuff += "}";
        } else if (this.props.h.indexOf("px") > 0) {
            stylebuff += "[Dialogid='" + this.gid + "'] .dialog{";
            stylebuff += "height:" + parseFloat(this.props.h) + "px;";
            stylebuff += "}";
        }
    }
    this.__styletemplate = stylebuff;
};

/**
 *
 * @param {string|object} params
 */
Dialog.prototype.setTitle = function () {

    if (typeof this.title === "string") {
        let text = this.title;
        this.title = {};
        this.title.text = text;
    } else if (typeof this.title === "object") {
        for (let k in this.title) {
            this.mem.dialog_header.title.setAttribute(k, this.title[k]);
        }
    }

    this.mem.dialog_header.title.innerHTML = this.title.text;
};

/**
 *
 */
Dialog.prototype.__setContent = function (opt) {
    if (opt.message) {
        this.mem.dialog_main.content.innerHTML = opt.message;
    } else {
        for (let i = 0; i < this.mem.root.children.length; ++i) {
            let ele = this.mem.root.children[i];
            if (ele.getAttribute(":dialog") === "content") {
                this.mem.dialog_main.content.appendChild(ele);
            }
        }
    }
};

Dialog.prototype.__setFooter = function (opt) {
    let btn = null;

    /* preset... */
    if (opt.onCancel) {
        btn = {};
        btn.cssClass = opt.cancelCssClass || opt.cancelCss || "";
        btn.text = opt.cancelText || "Cancel";
        btn.action = opt.onCancel;
        this.buttons.push(btn);
    }
    if (opt.onOk) {
        btn = {};
        btn.cssClass = opt.okCssClass || opt.okCss || "";
        btn.text = opt.okText || "Ok";
        btn.action = opt.onOk;
        this.buttons.push(btn);
    }

};

/**
 *
 * @param {utf-16} n
 */
Dialog.hotkey = function (n) {
    if (n === 13) {
        return "Enter";
    }
    return String.fromCharCode(n);
};

/**
 *
 * @return {*}
 * @private
 */
Dialog.prototype.__addFooterButtons = function () {
    let btns = document.createDocumentFragment();
    let btn = null;
    let _this = this;
    let i = 0;
    this.buttons.forEach(function (el) {
        let html = "";
        btn = document.createElement("button");
        html = el.text || el.label || "";
        btn.className = el.cssClass || "";
        if (el.action) {
            btn.onclick = function (e) {
                el.action(_this, e);
            }
        }
        if (el.title) {
            btn.title = el.title;
        }
        if (el.hotkey) {
            let hotk = document.createElement("div");
            hotk.className = "dialog-hotkey";
            btn.setAttribute("tabindex", i++);
            if (typeof el.hotkey === "number") {
                hotk.innerText = el.hotkey === 13 ? "Enter" : String.fromCharCode(el.hotkey);
                html = hotk.outerHTML + html;
            } else {

            }
        }
        btn.innerHTML = html;
        btns.appendChild(btn);
    }, this);

    this.mem.dialog_footer.root.appendChild(btns);
};


Dialog.GID = function () {

    return (Math.random()).toString(16).slice(2);
};



Dialog.buffer = [];

Dialog.alert = function (msg, title, cb) {
    let dom_c = null;
    if (!dom_c) {
        if (Dialog.buffer.length > 0) {
            dom_c = Dialog.buffer[0];
        } else {
            dom_c = document.createElement("div");
            dom_c.className=("dialog-container dialog-hidden");
            document.body.appendChild(dom_c);
            Dialog.buffer.push(dom_c);
        }
    }

    return new Dialog(dom_c,{
        title: title,
        message: msg,
        onOk: function (dialog,e) {
            cb(dialog,e);
        },
        feedback: Dialog.INFO,
        type: Dialog.INFO
    }).open();
};

Dialog.INFO = "info";
Dialog.SUCCESS = "success";
Dialog.ERR = "error";
Dialog.WARN = "warning";
Dialog.CONFIRM = "confirm";
Dialog.ANSWER = "answer";

Dialog.ANIMATE_DEFAULT = ["dialog-enter","dialog-leave","dialog-mask-enter","dialog-mask-leave"];
Dialog.ANIMATE_FROMTOP = ["dialog-enter-fromtop","dialog-leave-fromtop","dialog-mask-enter-fromtop","dialog-mask-leave-fromtop"];