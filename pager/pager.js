/**
 *
 * @param {DOM} pager_container
 * @param {int} size
 * @param {obj} bind
 * @param {fn} cb
 * @param {ojb} opt
 */
function pager(pager_container, size, onChange, opt) {
  console.assert( pager_container && size && onChange);

    this.dom_c = pager_container; // 在该dom下显示组件
    this.onChange = onChange; // 页数改变的回调

    this.index = 1;           // 当前页数
    this.default_index = 1;   // 默认当前页数

    this.size = size;         // 每页条数
    this.default_size = 10;   // 默认每页条数

    this.curr_pages = 5;      // 显示分页按钮数
    this.pages = undefined;   // 总页数


    this.count; // 总记录条数

    this.mem = null;


    this.style = {
        prev_class: "prev",
        jump_prev_class: "jump-prev",
        item_class: "item",
        item_select: "select",
        jump_next_class: "jump-next",
        next_class: "next"
    };

    this.el = {
        prev: "<i class=\"fa fa-angle-left\"></i>",
        jump_prev: "<i class=\"fa fa-ellipsis-h\"></i>",
        jump_prev_hover: "<i class=\"fa fa-angle-double-left\"></i>",
        item: "",
        jump_next: "<i class=\"fa fa-ellipsis-h\"></i>",
        jump_next_hover: "<i class=\"fa fa-angle-double-right\"></i>",
        next: "<i class=\"fa fa-angle-right\"></i>"
    };

    this._init();
}

// create items.
pager.prototype.__create = function(n) {

    this.mem.pages.items.forEach(function (el) {
            this.mem.pages.ul.removeChild(el);
    }, this)

    this.mem.pages.items = [];

    for (let i = 0; i < n; ++i) {
        this.mem.pages.items[i] = document.createElement("li");
        this.mem.pages.items[i].classList.add("item");
        this.mem.pages.ul.appendChild(this.mem.pages.items[i]);
    }

    this.mem.pages.ul.appendChild(this.mem.pages.jump_next);
    this.mem.pages.ul.appendChild(this.mem.pages.last);
    this.mem.pages.ul.appendChild(this.mem.pages.next);

    //this.mem.pages.last.innerText = this.pages;

};

pager.prototype.setPageSize = function(new_size) {
    if (new_size === this.size) {
        return;
    }

    // set new page size.
    this.size = new_size;

    this.setCount(this.count);
}

pager.prototype._init = function () {
    if (this.opt) {
        if (this.opt.style) {
            //
        }
    }


    this.mem = {
        root: this.dom_c,
        pages: {
            ul: document.createElement("ul"),
          prev: document.createElement("li"),
          first: document.createElement("li"),
          jump_prev: document.createElement("li"),
          items: new Array(this.curr_pages),
          jump_next: document.createElement("li"),
          last: document.createElement("li"),
          next: document.createElement("li"),
        },
        goto: document.createElement("goto"),
        size_opt: document.createElement("sizeopt")
    };

    //this.mem.pages.items.map(function(el) {
            //el = document.createElement("li");
    //})


    this.mem.pages.prev.classList.add(this.style.prev_class);
    this.mem.pages.next.classList.add(this.style.next_class);
    this.mem.pages.jump_prev.classList.add(this.style.jump_prev_class);
    this.mem.pages.jump_next.classList.add(this.style.jump_next_class);

    this.mem.pages.prev.innerHTML = this.el.prev;
    this.mem.pages.next.innerHTML = this.el.next;
    this.mem.pages.jump_prev.innerHTML = this.el.jump_prev + this.el.jump_prev_hover;
    this.mem.pages.jump_next.innerHTML = this.el.jump_next + this.el.jump_next_hover;


    this.mem.pages.ul.appendChild(this.mem.pages.prev);
    this.mem.pages.ul.appendChild(this.mem.pages.first);
    this.mem.pages.ul.appendChild(this.mem.pages.jump_prev);
    this.__create(this.mem.pages.items.length);
    //this.mem.pages.ul.appendChild(this.mem.pages.jump_next);
    //this.mem.pages.ul.appendChild(this.mem.pages.last);
    //this.mem.pages.ul.appendChild(this.mem.pages.prev);

    this.mem.root.appendChild(this.mem.pages.ul);

    this.mem.pages.first.innerText = 1;

    this.mem.pages.ul.addEventListener("click", this.__goto.bind(this), false);

    //this.mem.pages.prev.addEventListener("click", this.__goto.bind(this), false);
    //this.mem.pages.next.addEventListener("click", this.__goto.bind(this), false);

    //this.mem.pages.jump_prev.addEventListener("mouseover", this.__jumphover.bind(this), false);


    //this.render();
};

pager.prototype.__goto = function(e) {

    if (e.target === this.mem.pages.prev) {
        if (this.index > 1) {
            --this.index;
        }
    } else if (e.target === this.mem.pages.next) {
        if (this.index < this.pages) {
            ++this.index;
        }
    } else if (e.target === this.mem.pages.jump_prev) {
        this.index = this.index - this.curr_pages;
        if (this.index < 1) {
            this.index = 1;
        }
    } else if (e.target === this.mem.pages.jump_next) {
        this.index = this.index + this.curr_pages;
        if (this.index > this.pages) {
            this.index = this.pages;
        }
    } else {
        let page = Number(e.target.innerText);
        if (Number.isNaN(page)) {
            return;
        }

        if (page >= 1 && page <= this.pages) {
            this.index = page;
        }
    }

    this.render();
    this.onChange(this.index, this.count);
}


pager.prototype.setCount = function (count) {
    this.count = count;
    let pages = parseInt( (this.count - 1) / this.size + 1 );
    let prev_pages = this.pages;
    this.pages = pages;

    // first call method setCount
    if (prev_pages === undefined) {
        this.__create(this.pages < this.curr_pages ? this.pages : this.curr_pages);

    // pages: 2 change into 3  or   3 change into 2
    // the second condition is prevent repeat create
    } else if (pages < this.curr_pages && pages !== prev_pages) {
        this.__create(pages);

    // pages: 4 change into 100
    } else if (pages >= this.curr_pages && prev_pages < this.curr_pages) {
        this.__create(this.curr_pages);

    // pages: 5 change into 4
    } else if (pages < this.curr_pages && prev_pages >= this.curr_pages) {
        this.__create(pages);
    }

    if (this.index > this.pages) {
        this.index = this.pages;
    }

    this.render();
    this.onChange(this.index, this.count);
};

pager.prototype.render = function () {

    let begin, end;
    //let critical = Number.parseInt(this.curr_pages / 2) + 1;
    let critical; // 是否浮动的临界值

    if (this.pages <= this.curr_pages) { // 全部page <= 要显示的page
        critical = this.pages;
    } else {
        critical = Number.parseInt(this.curr_pages / 2) + 1;
    }

    let lfixed = 0x01, //要显示的按钮固定在左边
        rfixed = 0x02, //要显示的按钮固定在左边
        float = 0x04,  // 要显示的按钮浮动
        lmore = 0x08, // 显示左边的快进
        rmore = 0x10, // 显示右边的快进
        first = 0x20, last = 0x40;  // 显示左右两边的数字

    let state = 0;

    if (this.index === 1) {
        this.mem.pages.prev.classList.add("disabled");
    } else {
        this.mem.pages.prev.classList.remove("disabled");
    }


    if (this.index === this.pages) {
        this.mem.pages.next.classList.add("disabled");
    } else {
        this.mem.pages.next.classList.remove("disabled");
    }



    // curr_pages = 5
    // < 1 2 3 4 5
    if (this.index <= critical) {
        state |= lfixed;

        begin = 1;

        // < 1 2 3 4 5 >
        if (this.pages - this.curr_pages <= 0) {
             end = this.pages;
        }

        //  < 1 2 3 4 5 6 >
        if (this.pages - this.curr_pages > 0) {
            state |= last;
            end = this.curr_pages;
        }
        // < 1 2 3 4 5 ... 7>
        if (this.pages - this.curr_pages > 1) {
            state |= rmore;
            end = this.curr_pages;
        }

    }
    // 3 4 5 6 7 >
    // 2 3 4 5 6 >
    else if (this.index >= this.pages - critical + 1) {
        state |= rfixed;

        begin = this.pages - this.curr_pages + 1;
        end = this.pages;

        // < 1 3 4 5 6 7 >
        // < 1 2 3 4 5 6 >
        if (this.pages - this.curr_pages > 0) {
            state |= first;
        }

        // < 1 ... 3 4 5 6 7 >
        if (this.pages -this.curr_pages > 1) {
            state |= lmore;
        }
    }
    else {

        state |= float;

        begin = this.index - Number.parseInt(this.curr_pages / 2);
        end = this.index + Number.parseInt(this.curr_pages / 2);

        // begin : 2
        // < 1 2 3 4 5 6 >
        if (begin - 1 > 0) {
            state |= first;
        }

        // begin : 3
        // < 1 ... 3 4 5 6 7 >
        if (begin - 1 > 1) {
            state |= lmore;
        }

        // end : 5
        // pages : 6
        // < 1 2 3 4 5 6>
        if (this.pages - end > 0) {
            state |= last;
        }

        // end : 5
        // pages : 7
        // < 1 2 3 4 5 ... 7 >
        if (this.pages - end > 1) {
            state |= rmore;
        }
    }


    for (let i = begin, j = 0; i <= end; ++i, ++j) {
        this.mem.pages.items[j].innerText = i;

        if (this.index === i) {
            this.mem.pages.items[j].classList.add("select");
        } else {
            this.mem.pages.items[j].classList.remove("select");
        }
    }



    if (state & first) {
        this.mem.pages.first.classList.remove("hidden");
    } else {
        this.mem.pages.first.classList.add("hidden");
    }

    if (state & lmore) {
        this.mem.pages.jump_prev.classList.remove("hidden");
    } else {
        this.mem.pages.jump_prev.classList.add("hidden");
    }


    if (state & rmore) {
        this.mem.pages.jump_next.classList.remove("hidden");
    } else {
        this.mem.pages.jump_next.classList.add("hidden");
    }

    if (state & last) {
        this.mem.pages.last.classList.remove("hidden");
    } else {
        this.mem.pages.last.classList.add("hidden");
    }

    if (state & float) {
        this.mem.pages.first.classList.remove("hidden");
        this.mem.pages.last.classList.remove("hidden");
    }

    if (this.pages !== parseInt(this.mem.pages.last.innerText)) {
        this.mem.pages.last.innerText = this.pages;
    }


};
