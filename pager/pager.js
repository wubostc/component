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
        next_class: "next",
        hidden_class: "pager-hidden"
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

pager.prototype.__create = function(n) {

    this.mem.pages.items.forEach(function (el) {
        this.mem.pages.ul.removeChild(el);
    }, this)

    this.mem.pages.items = [];

    for (let i = 0; i < n; ++i) {
        this.mem.pages.items[i] = document.createElement("li");
        this.mem.pages.ul.appendChild(this.mem.pages.items[i]);
    }

    this.mem.pages.ul.appendChild(this.mem.pages.jump_next);
    this.mem.pages.ul.appendChild(this.mem.pages.last);
    this.mem.pages.ul.appendChild(this.mem.pages.next);

    this.mem.pages.last.innerText = this.pages;

};

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
    this.mem.pages.jump_prev.innerHTML = this.el.jump_prev;
    this.mem.pages.jump_next.innerHTML = this.el.jump_next;


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

    //this.mem.pages.jump_prev.addEventListener("click", this.__jump.bind(this), false);
    //this.mem.pages.jump_next.addEventListener("click", this.__jump.bind(this), false);


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

        // pages: 4 change into 5
    } else if (pages >= this.curr_pages && prev_pages < this.curr_pages) {
        this.__create(pages);

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
    let critical = Number.parseInt(this.curr_pages / 2) + 1;
    let lfixed = 0x01, rfixed = 0x02, float = 0x04,
        lmore = 0x08, rmore = 0x10, first = 0x20, last = 0x40;
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
        this.mem.pages.first.classList.remove(this.style.hidden_class);
    } else {
        this.mem.pages.first.classList.add(this.style.hidden_class);
    }

    if (state & lmore) {
        this.mem.pages.jump_prev.classList.remove(this.style.hidden_class);
    } else {
        this.mem.pages.jump_prev.classList.add(this.style.hidden_class);
    }


    if (state & rmore) {
        this.mem.pages.jump_next.classList.remove(this.style.hidden_class);
    } else {
        this.mem.pages.jump_next.classList.add(this.style.hidden_class);
    }

    if (state & last) {
        this.mem.pages.last.classList.remove(this.style.hidden_class);
    } else {
        this.mem.pages.last.classList.add(this.style.hidden_class);
    }

    if (state & float) {
        this.mem.pages.first.classList.remove(this.style.hidden_class);
        this.mem.pages.last.classList.remove(this.style.hidden_class);
    }



};


(function ($, document) {
    var DefaultOpts = {
        MaxPageview: 5,
        PageSizeOptions: [20, 50, 100],
        OnChange: null,
        Pageloading: null,
        PageType: "normal",
        ShowQuickJumper:false,
        ShowSizeChanger:false,
        ShowTotal:false,
        Simple:false,
        Small:false,
        DefaultPageSize:20,
        PageoptionItemFormat:'{0}条/页',
        TotalFormat: "共查询到{0}数据"
    }
    var LmPager = function (selector, options) {
        this.style ={
            mini_class:"mini",
            page_item_class:"page_item",
            total_text_class:"totaltext",
            prev_class: "prev",
            jump_prev_class: "jump-prev",
            item_class: "item",
            item_select: "select",
            jump_next_class: "jump-next",
            next_class: "next",
            goto_class:"goto",
            page_options_class:"page_option"
        };
        this.el = {
            prev: "<i class=\"fa fa-angle-left\"></i>",
                jump_prev: "<i class=\"fa fa-ellipsis-h\"></i><i class=\"fa fa-angle-double-left\"></i>",
                item: "",
                jump_next: "<i class=\"fa fa-ellipsis-h\"></i><i class=\"fa fa-angle-double-right\"></i>",
                next: "<i class=\"fa fa-angle-right\"></i>",
                goto: '<div>跳转<input type="text" value=""></div>',
        };
        this.tipstr = {
            prev: "前一页",
                jump_prev: "前{0}页",
                item: "第{0}页",
                jump_next: "后{0}页",
                next: "后一页",
        };
        this.$element = $(selector);
        var _this = this;
        if(this.$element.data("Pagger"))
        {
            _this = this.$element.data("Pagger");
        }
        //默认参数
        _this.options = $.extend({ }, DefaultOpts, options);
        if(!options.DefaultPageSize)
        {
            _this.options.DefaultPageSize = _this.options.PageSizeOptions[0];
        }
        _this._init();
        return _this;
    };
    LmPager.prototype = {
        _pageDiv: null,
        PageIndex:1,
        RecordCount:0,
        PageCount:0,
        PageSize:20,
        OnChange:null,
        _renderprifix:null,
        _init: function () {
            this.PageIndex = 1;
            this.RecordCount = 0;
            this.PageCount = 0;
            this.PageSize = this.options.DefaultPageSize;
            this.OnChange = this.options.OnChange;
            if(!this.$element.data("Pagger"))
            {
                this._render();
                this._attachEvent();
            }
            this.$element.data("Pagger",this);
            this._renderprifix = Date.now();
        },
        _attachEvent:function () {
            var _this = this;
            this.$element.on("click","ul li",function (e) {
                var oldindex = _this.PageIndex;
                if($(this).hasClass(_this.style.prev_class))
                {
                    _this.PageIndex =Math.max(1,_this.PageIndex-1);
                }
                if($(this).hasClass(_this.style.next_class))
                {
                    _this.PageIndex =Math.min(_this.PageCount,_this.PageIndex+1);
                }
                if($(this).hasClass(_this.style.jump_prev_class))
                {
                    _this.PageIndex =Math.max(1,_this.PageIndex-_this.options.MaxPageview);
                }
                if($(this).hasClass(_this.style.jump_next_class))
                {
                    _this.PageIndex =Math.min(_this.PageCount,_this.PageIndex+_this.options.MaxPageview);
                }
                if($(this).hasClass(_this.style.item_class))
                {
                    var curindex = $(this).data("pageindex");
                    _this.PageIndex =Math.max(1, Math.min(_this.PageCount,curindex));
                }
                if(oldindex!=_this.PageIndex)
                {
                    _this._pageitemrender();
                    if(_this.OnChange)
                    {
                        _this.OnChange(_this.PageIndex,_this.PageSize);
                    }
                }
            });

            this.$element.on("keyup","."+_this.style.goto_class+' input' , function (event) {
                if (event.keyCode == "13") {
                    var curindex = Math.max(1, Math.min(_this.PageCount,parseInt($(this).val())));
                    $(this).val("");
                    if(_this.PageIndex !=curindex)
                    {
                        _this.PageIndex =curindex;
                        if(_this.OnChange)
                        {
                            _this.OnChange(_this.PageIndex,_this.PageSize);
                        }
                        _this._pageitemrender();
                    }
                }
            });

            this.$element.on("change","."+_this.style.page_options_class+' select',function () {
                _this.PageSize = Math.max(2,$(this).val());
                _this.PageCount = Math.ceil(_this.RecordCount*1.0/(_this.PageSize*1.0));
                _this.PageIndex = Math.max(1, Math.min(_this.PageCount,_this.PageIndex));
                _this._pageitemrender();
                if(_this.OnChange)
                {
                    _this.OnChange(_this.PageIndex,_this.PageSize);
                }
            });
        },
        SetCount: function (recordCount) {
            this.RecordCount = recordCount;
            this.PageCount = Math.ceil(this.RecordCount*1.0/(this.PageSize*1.0));
            this._pageitemrender();
            if(this.options.ShowTotal&&this._totalContent)
            {
                this._totalContent.html(this.options.TotalFormat.format(recordCount,Math.max(1,(this.PageIndex-1)*this.PageSize+1),Math.min(recordCount,this.PageIndex*this.PageSize) ));
            }
        },

        _pageitemrender:function () {
            this.$element.find("li[itemprifix="+this._renderprifix+"]").remove();
            var psplit = Math.floor(this.options.MaxPageview / 2);
            if (this.PageIndex > 1) {
                this.$element.find("."+this.style.prev_class).attr("disabled",false);
                this.$element.find("."+this.style.prev_class).removeClass("disabled");
            } else {
                this.$element.find("."+this.style.prev_class).attr("disabled",true);
                this.$element.find("."+this.style.prev_class).addClass("disabled");
            }
            var start = 1, end = this.PageCount;
            if (this.PageCount > this.options.MaxPageview + 2) {
                if (this.PageIndex  - psplit - 2 > 0) {
                    this._createpageitem(this.style.item_class,'1',this.tipstr.item.format(1),1);
                    this._createpageitem(this.style.jump_prev_class,this.el.jump_prev,this.tipstr.jump_prev.format(this.options.MaxPageview));
                    start = Math.max(Math.min(this.PageIndex - psplit, this.PageCount - this.options.MaxPageview - 1), 1);
                }
                end = Math.min(Math.max(this.options.MaxPageview,this.PageIndex + psplit), this.PageCount);
            }
            for (; start <= end && start <= this.PageCount; start++) {
                var pli = this._createpageitem(this.style.item_class,start+'',this.tipstr.item.format(start),start);
                if(this.PageIndex==start)
                {
                    pli.addClass(this.style.item_select);
                }
            }
            if (end + 1 < this.PageCount) {
                this._createpageitem(this.style.jump_next_class,this.el.jump_next,this.tipstr.jump_next.format(this.options.MaxPageview));
            }
            if (end < this.PageCount) {
                this._createpageitem(this.style.item_class,this.PageCount+'',this.tipstr.item.format(this.PageCount),this.PageCount);
            }
            if (this.PageIndex < this.PageCount) {
                this.$element.find("."+this.style.next_class).attr("disabled",false);
                this.$element.find("."+this.style.next_class).removeClass("disabled");
            } else {
                this.$element.find("."+this.style.next_class).attr("disabled",true);
                this.$element.find("."+this.style.next_class).addClass("disabled");
            }
        },

        _createpageitem:function (cls,html,tipstr,pageindex) {
            var li = document.createElement("li");
            li.classList.add(cls);
            $(li).attr("itemprifix",this._renderprifix);
            $(li).attr("title",tipstr);
            $(li).html(html);
            if(pageindex)
            {
                $(li).data("pageindex",pageindex);
            }
            this.$element.find("."+this.style.next_class).before($(li));
            return $(li);
        },

        _render: function () {
            var docfrag = document.createElement("div");
            $(docfrag).addClass("pager-container");
            if(this.options.Small)
            {
                $(docfrag).addClass("mini");
            }
            var ul = document.createElement("ul");
            if(!this.options.Simple)
            {
                var priebtn = document.createElement("li");
                priebtn.classList.add(this.style.prev_class);
                priebtn.classList.add("disabled");
                $(priebtn).html(this.el.prev);
                $(priebtn).attr("title",this.tipstr.prev);
                ul.appendChild(priebtn);
                var nextbtn = document.createElement("li");
                nextbtn.classList.add(this.style.next_class);
                nextbtn.classList.add("disabled");
                $(nextbtn).html(this.el.next);
                $(nextbtn).attr("title",this.tipstr.next);
                ul.appendChild(nextbtn);
                if(this.options.ShowSizeChanger)
                {
                    var sizechange = document.createElement("li");
                    var sizeselect = document.createElement("select");
                    sizechange.classList.add(this.style.page_options_class);
                    for(var i=0;i<this.options.PageSizeOptions.length;i++)
                    {
                        var cpsize = this.options.PageSizeOptions[i];
                        var psopt =  document.createElement("option");
                        $(psopt).attr("value",cpsize);
                        $(psopt).html(this.options.PageoptionItemFormat.format(cpsize));
                        if(cpsize==this.options.DefaultPageSize)
                        {
                            $(psopt).attr("selected","selected");
                        }
                        sizeselect.appendChild(psopt);
                    }
                    sizechange.appendChild(sizeselect);
                    ul.appendChild(sizechange);
                }
                 if(this.options.ShowQuickJumper)
                 {
                     var quickjumper = document.createElement("li");
                     quickjumper.classList.add(this.style.goto_class);
                     $(quickjumper).html(this.el.goto);
                     ul.appendChild(quickjumper);
                 }
                 if(this.options.ShowTotal)
                 {
                     var total = document.createElement("li");
                     total.classList.add(this.style.total_text_class);
                     $(total).html(this.options.TotalFormat.format(0));
                     ul.appendChild(total);
                     this._totalContent =  $(total);
                 }
                docfrag.appendChild(ul);
            }
            this.$element.append(docfrag);
        },

        request: function (url, param,webaction, callback) {
            var curPage = this;
            if(!webaction)
            {
                webaction= WebApiAction.Get;
            }
            param.PageIndex = this.PageIndex;
            param.PageSize = this.PageSize;
            if (this.options.Pageloading) {
                this.options.Pageloading.startAjaxrestfull(url, param, webaction, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].pageNumber = (curPage.PageIndex - 1) * curPage.PageSize + i + 1;
                    }
                    if (data.Total_Count) {
                        curPage.SetCount(data.Total_Count);
                    }
                    if (callback) {
                        callback(data);
                    }
                });
            } else {
                ajaxWebApi(url, param, webaction, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        data[i].pageNumber = (curPage.PageIndex - 1) * curPage.PageSize + i + 1;
                    }
                    if (data.Total_Count) {
                        curPage.SetCount(data.Total_Count);
                    }
                    if (callback) {
                        callback(data);
                    }
                });
            }
            return false;
        }
    };
    $.fn.InitPager = function (options) {
        if (!options.MaxPageview) {
            options.MaxPageview = 5;
        }
        options.PageType = "normal";
        var df = new LmPager(this, options);
        return df;
    };

})(jQuery, document);