
dialog 使用非常简单，如 1 所示, `<div class="mydialog1 ">...</div>`
表示dialog的DOM容器，之后只需调用
`new Dialog(document.querySelector(".mydialog1"),...)` 即可。
`<div :dialog="content">...</div>` 表示 dialog 要显示的内容。
 1. 

```html
<div class="mydialog1 ">
    <div :dialog="content">
        cccccccccc
        <div>lslslslslskdkjf <span>sss</span></div>
        <select name="" id="" onchange="ch('mydialog1')">
            <option value="1">ddd</option>
            <option value="2">ddd</option>
            <option value="3">ddd</option>
            <option value="4">ddd</option>
        </select>
    </div>
</div>
```
```javascript
    var vm = {
        f:function (dialog) {
            console.log("enter",this, dialog);
        }
    }
    var mydialogmodal = new Dialog(document.querySelector(".mydialog1"),
        {
            modal: true,
            w: "500*",h:"100*",
            animate: Dialog.ANIMATE_DEFAULT,
            draggable: true,
            anchor: [0.5, 0.5],
            title: {
                text: "<a>biaoti</a>",
                style: "color:red;background:#f0a344",
                mydialog: 1
            },
            feedback: Dialog.ANSWER,
            okCssClass: "primary lg",
            okText: "<a>kokoko</a>",
            onOk: function (dialog, e) {
                console.log("ok", dialog, e)
            },
            cancelCssClass: "danger ",
            cancelText:"<a>okokok</a>",
            onCancel: function (d, e) {
                console.log("cancel", d, e);
                d.leave();
            },
            onshow: vm.f.bind(vm),
            onhide: (function (dialog) {
                console.log("leave!", this, dialog);

            }).bind(vm22),
            top: "200px",
            closeable:true,
            minable:false,
            restoreable:false
        });
```
之后调用一下 `mydialogmodal.open()` 即可。下面是效果图。
[1.png](test/1.png)

2.快捷方法
`Dialog.alert("<a href='#'>dddddddddddddd<br/>eeeeeeeeeeeeeeeeeeemo</a>", "ttt",function(d){d.close()})`

Dialog的构造方式是`function Dialog(dialog_container, opt)`，
其中 `opt`：

<br/>
<h2>可用的function</h2>

| 属性名   | 描述  |  默认  |
| -----  | ------ | :-----  |
| onshow() | 调用 ```open()``` 后动画开始时回调，回调的参数包含 dialog 的 this 和事件对象 |   ```null```   |
| onhide() | 调用 ```close()``` 后动画开始时回调，回调的参数包含 dialog 的 this 和事件对象 |   ```null```   |
| onshown()  |调用 ```open()``` 后动画结束时回调，回调的参数包含 dialog 的 this 和事件对象 |  ```null```  |
| onhidden()  |调用 ```close()``` 后动画结束时回调，回调的参数包含 dialog 的 this 和事件对象 |  ```null```  |
| onblur()  | dialog 失去焦点时调用，回调的参数包含 dialog 的 this 和事件对象 |  ```null```  |
| onfocus()  | dialog 得到焦点时调用，回调的参数包含 dialog 的 this 和事件对象 |  ```null```  |
| open()  | 打开一个实例化的 dialog |   |
| close()  | 关闭一个实例化的 dialog |   |
|setTitle()|ref 可选的属性->`title`||
|setPos()|包含2个元素的数组，当元素类型是`float`时，被视为百分比<br/>e.g.<br/>`["45.5%","55.5%"]` `[45.5%,55.5%]` 对应浏览器客户端的宽高<br/>`["900px", "500px]` 将被转成百分比对应浏览器客户端的宽高||
||||

<br/>
<h2>dialog的生命周期</h6>

<i> `open()->onshow()->onshown()->onfocus()->dosomething()`</i>
<br/>
<i> `close()->onhide()->onhidden()->onblur()`</i>

<br/>
<h2>可选的属性</h2>

| 属性名   | 描述  |  默认  |
| -----  | ------ | :------:  |
| modal | 调用 ```open()``` 后动画开始时回调 |   ```false```   |
| closeable | 是否显示关闭按钮 |   ```true```   |
| title | ```string``` 或 ```object```，当是 ```object``` 类型时，应该至少包含 ```text``` 属性，其他属性将作为```setAttribute```的参数被设置。 |   ```" "```   |
| buttons | 可以设置多个按钮，每个元素是一个 ```object``` 包含：<br/>```text```       按钮文字（接受html标签）<br/> ```label``` 同 ```text``` <br/> ```cssClass``` 按钮样式 <br/> ```action``` 点击按钮事件，参数是dialog对象和事件对象 <br/> ```title``` 按钮的提示文字<br/>```hotkey``` 按钮热键 | ```[]``` |
|w|dialog宽，e.g. <br/> ```"400px"``` dialog宽是400px<br/>```"400*"``` dialog最小宽是400px，根据内容自动扩充大小 | ```""``` |
|h|dialog高，e.g. <br/> ```"400px"``` dialog高是400px<br/>```"400*"``` dialog最小高是400px，根据内容自动扩充大小 | ```""``` |
|draggable|dialog 是否可拖动|```true```|
|feedback|dialog 显示的图标，包含 `Dialog.INFO` `Dialog.SUCCESS` `Dialog.ERR` `Dialog.WARN` `Dialog.CONFIRM` `Dialog.ANSWER`  |```""```|
|type|dialog头部样式包含的(颜色)值，同feedback|```""```|
|top|dialog锚点距离浏览器顶部距离|```"40%"```|
|left|dialog锚点距离浏览器左侧距离|```"50%"```|
|anchor|dialog锚点|```[0.5, 0.5]```|
|animate|调用 `open()` 和 `close()` 时生效，可以设置 `false` ，可选值：<br/>`Dialog.ANIMATE_DEFAULT` `ANIMATE_FROMTOP` |```Dialog.ANIMATE_DEFAULT```|
|zIndex|固定`z-index`值|```null```|
|message|显示在dialog，<b>NOTE</b>: 优先级高于`<div :dialog="content">...</div>`||