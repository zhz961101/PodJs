# PodJs
web MVVM framework

# Usage
### 简单实例
模板
```Html
<div id="app1">
    <p>{{ msg }}</p>
    <input type="text" name="" bind:value="msg" on:keyup="msg=self.value">
    <button type="button" name="button" on:click="msg=msg+msg">deouble!!</button>
    <button type="button" name="button" on:click="addRandom()">push random item!</button>
    <ul>
        {{ for(let item of items){ }}
            <li>{{ item }}</li>
        {{ } }}
    </ul>
</div>
```
代码
```javascript
let app = Poi({
    el: "#app1",
    data: {
        msg: "Poi! ",
        items: ["touch random!"],
        addRandom: function() {
            this.items.push(Math.floor((Math.random() * 100)))
        }
    },
    watch: {
        msg: self => {
            console.log(self)
        },
        items: self => {
            console.log(self)
        }
    }
})
```
### component
> component可以访问顶级data
```html
<div id="app">
  ...
  <rLink to="index">HOME</rLink>
  ...
</div>
```
```javascript
let router = Poi({
    // ...
    pos:{
        rLink:{
            tpl: `<a href="#/{{ to }}" class="{{ state() }}">{{ _content }}</a>`,
            data: {
                state:function(){
                    if(this.currentPage=="/"+this.to){
                        return "active"
                    }
                    return ""
                }
            }
        }
    }
    // ...
})
```
### template
```html
<script type="text/x-template" id="app-template" charset="utf-8"></script>
```
> 建议使用script标签来编写poi的模板，避免写在正常html中被浏览器预编译后无法识别的情况
# Todo
1.重构diff
2.将模板引擎中的指令解耦出来，取消event-id设定

# 其他
1.关于维护，现在代码工程化还很差，我自己debug的时候都很让人头大（即使连1k行都没有）
2.关于定位，就是个玩具，不过在上一周憋了半天终于凑出了组件（component，在代码上也就是Po里的subpo）的实现，已经满足很大一部分的需求了，接下来的如果有空也很少会patch现在的核心代码（也许吧）
3.关于性能，没有，或者有...以现在这个比较死板的diff算法确实可以在一定层次上管理性能，但是面对很多（>=500）个子节点的元素上，性能这块就难以保证了，我选择直接忽视这个情况，毕竟...少数嘛（想了解究竟有多卡的，可以看看example目录下的元胞自动机）
