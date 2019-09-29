<span style="float:right;font-size:2.5rem;">📜🔄📦</span>
# 🔮PoiJs

![LICENSE badge](https://img.shields.io/badge/license-GPL3.0-blue)
![size badge](https://img.shields.io/badge/size-14.6K-green)

mvvm framework.

# Index
- [Background](#Background)
- [Features](#Features)
- [Install](#Install)
- [Usage](#Usage)
    - [Hello world](#Hello-world)
    - [Custom Element](#Custom-Element)
- [Changelog](#Changelog)
- [Todo](#Todo)
- [LICENSE](#LICENSE)

# Background
Poi 源于一个偷懒的想法，要是可以从一个对象直接映射到web app该多好。
```js
const poi = obj => `html`;
```
`data => view`，开发者将专注数据的交互和变化，将其余的都交给代码自己完成就好了。看似懒得不能再懒，其实中间确实有很多工作可以做，比较火的一些框架也在实践这种想法。

除此之外，JavaScript快速发展推陈出新，与最开始的模样已经天翻地覆，甚至能进行一定程度的`元编程`，这就很令人兴奋，交互数据流的设计变得更加自然且方便维护。
```js
const callStr = new Proxy({...},{...})
const s1 = callStr.wow["! "].Metaprogramming.is.awesome["!"].string()
console.log(s1) // wow! Metaprograming is awesome !
```
同时不仅社区在关注web模块化开发的问题，其实标准定制组织和各个浏览器厂商也在考虑这些问题，其中就有很多能直接使用的东西，比如web component比如shadow dom。

- [MDN - Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [google - Building Components](https://developers.google.com/web/fundamentals/web-components/)

now，一种船新的web开发模式来了，可能是你现在所见的`poi`或是别的什么，甚至你自己也可以动手搞一搞。

# Features
- es+:
不管是新建poi还是创建插件，均已class的形式，直观，最大限度支持复用
- 标准:
基于web新标准带来的组件系统，支持完美css js隔离，且容易向下兼容
- js-base:
js语法编写模板，最大限度减少学习成本
- light:
轻量且容易魔改

# Install
```
git clone --depth=1 https://github.com/zhzLuke96/PoiJs.git; \
cd PoiJs; npm i; npm run build;
```

```
# development pack
npm run dev
# development pack with --watch mode
npm run dev:W

# build pack
npm run build
# build pack with --watch mode
npm run build:W
```

# Usage


## Hello world
```html
<input type="text" placeholder="some text" @change="msg = $dom.value" value="{{= msg }}">
<button @click="msg = msg + msg;">double</button>
<button @click="reverse()">reverse</button>
<br>
<span>{{= msg }}</span>
```
```js
class appPoi extends Poi.Mixin(PoiLisenter) {
    constructor($dom) {
        super()
        this.$ = $dom || document.body;
        this.msg = "Hello world ! "
        this.init()
        // this.render()
    }
    get tpl(){
        // ...
    }
    reverse(){
        this.msg = this.msg.split(" ").reverse().join(" ");
    }
}

const app = new appPoi("#app")
```

## Custom Element
random font color button.
```html
<c-btn name="Poi">passed name</c-btn>
<c-btn name="poi">failed name</c-btn>
```

````js
class colorBtn extends Poi.Ele {
    constructor() {
        super()
        this.name = "poi"
        this.name_vaild = true
    }
    get tpl() {
        return `<button style='color:{{= font_color }};border: 1px solid {{= name_vaild ? 'green' : 'red' }};'>{{= name }}<slot>click!</slot></button>`
    }
    get font_color() {
        return '#' + (Math.random() * 0xffffff << 0).toString(16)
    }
    get props() {
        return {
            name: {
                type: String,
                // required: true,
                defalut: "poi",
                validator(value) {
                    return this.name_vaild = /^([A-Z])\w+$/.test(value);
                },
                failed(){
                    console.warn("failed")
                },
                passed(){
                    console.log("passed")
                }
            }
        }
    }
};
new colorBtn().named("c-btn");
````

# Changelog
- 重构了整个代码
- 增加mustrender，以限制render调用的帧率
- 增加mixin功能，通过mixin修改默认行为
- 修改jx模板引擎，增加钩子功能，支持魔改
- 添加初步的自定义元素支持，基于web componet，部分环境需要自配polyfill
- 修改diff算法，增加insert merge特性
- 修改diff算法，patch动作限定为三种，insert delete replace

# Todo
- [x] refactoring
- [ ] Finish guide md file
- [ ] Data binding
> 使用事件模型或其他方式隐藏数据绑定行为
- [ ] Two-way data binding
> 处理特殊元素的双向绑定需求
- [ ] Pass-by-value (object)
> 支持所有类型的绑定传递
- [ ] poi-import tag
> 支持```<poi-import src="./app.html">```
- [ ] async render
> 通过模拟协程的方式实现异步渲染，且可以中断
- [ ] async function
> 支持异步函数
- [ ] render functions
> 解析html生成render tree结构，优化渲染性能
- [ ] poi-loader
> render function预编译

# LICENSE
GPL-V3.0