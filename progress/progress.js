"use strict";

console.assert(Map, "the progress is not support this browser, please update your brower!")
console.assert(progress, "the progress has been defined!");

/**
 *
 * @param progress_container
 * @param {Object} opt
 *     { ondrag: func, val: 1, max: 100 }
 */
function progress(progress_container, opt) {
    console.assert(progress_container);

    if (!progress.pool) {
        progress.pool = new Map();
    }
    if (progress.pool.has(progress_container)) {
        return progress.pool.get(progress_container);
    } else {
        progress.pool.set(progress_container, this);
    }

    this.style = {
        progress_class: "progress",
        progress_max_class: "progress-max",
        progress_value_class: "progress-value",
        controller_class: "controller"
    };

    this.ondrag = null;
    this.val = 1;
    this.max = 100;

    if (opt) {
        if (opt.ondrag) {
            this.ondrag = opt.ondrag;
        }
        if (opt.val) {
            this.val = opt.val;
        }
        if (opt.max) {
            this.max = opt.max;
        }
    }

    console.assert(this.val <= this.max);

    this.mem = null;
    this.__init(progress_container);
}

progress.prototype.__init = function (dom_c) {
    this.mem = {
        root: dom_c,
        progress: document.createElement("div"),
        val: document.createElement("div"),
        max: document.createElement("div"),
        controller: document.createElement("div")
    };

    this.mem.progress.classList.add(this.style.progress_class);
    this.mem.val.classList.add(this.style.progress_value_class);
    this.mem.max.classList.add(this.style.progress_max_class);
    this.mem.controller.classList.add(this.style.controller_class);


    this.mem.val.setAttribute("value", this.val);
    this.mem.max.setAttribute("max", this.max);
    this.mem.controller.setAttribute("value", this.val);
    this.mem.controller.setAttribute("draggable", "true");

    let docfrag = document.createDocumentFragment();
    docfrag.appendChild(this.mem.max);
    docfrag.appendChild(this.mem.val);
    // progress = docfrag->max;
    // progress = docfrag->val;
    // docfrag->max = null;
    // docfrag->val = null;
    this.mem.progress.appendChild(docfrag);

    // docfrag.children === null
    docfrag.appendChild(this.mem.progress);
    docfrag.appendChild(this.mem.controller);

    let wrapper =document.createElement("div");
    wrapper.classList.add("wrapper");
    wrapper.appendChild(docfrag);

    this.mem.root.appendChild(wrapper);

    this.offset = this.mem.controller.offsetLeft;

    if (this.ondrag) {
        this.mem.controller.addEventListener("dragstart", this.__ondragstart.bind(this), false);
        this.mem.controller.addEventListener("drag",      this.__ondrag.bind(this),      false);
        this.mem.controller.addEventListener("dragend",   this.__ondragend.bind(this),   false);
    }
    if (this.onclick) {
        //this.mem.progress.
    }
};

progress.prototype.__ondragstart = function (e) {
    // console.log("start "+e.clientX)
    this.__startx = e.clientX;
    this.__startleft =  this.val;
};

progress.prototype.__ondrag = function (e) {
    // for chrome
    if (e.clientX === 0) return;

    let val = this. __startleft +(e.clientX - this.__startx) / parseFloat(this.mem.progress.offsetWidth) * this.max;
    this.setValue(val);
    this.ondrag(this.val);
};

progress.prototype.__ondragend = function (e) {
    // console.log("end  "+e.clientX)
};

progress.prototype.setValue = function(new_val) {
    if (new_val === this.val) {
        return new_val;
    }

    if (new_val > this.max) {
        new_val = this.max;
    } else if (new_val < 0) {
        new_val = 0;
    }

    let last_val = this.val;
    this.val = parseInt(new_val);

    this.render();
    return last_val;
};

progress.prototype.setMax = function (new_max) {
    console.assert(new_max >= 0);
    this.max = new_max;
    this.render();
};

progress.prototype.render = function() {

    this.mem.val.setAttribute("value", this.val);
    this.mem.val.style.width = this.val / this.max * 100 + "%";

    this.mem.controller.setAttribute("value", this.val);
    this.mem.controller.style.left = this.val / this.max * 100 + "%";
};
