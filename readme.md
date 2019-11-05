![taco](https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/taco_1f32e.png)

# Taco

[![Build Status](https://travis-ci.org/zhzLuke96/TacoJs.svg?branch=master)](https://travis-ci.org/zhzLuke96/TacoJs)
[![Coverage Status](https://coveralls.io/repos/github/zhzLuke96/TacoJs/badge.svg?branch=master)](https://coveralls.io/github/zhzLuke96/TacoJs?branch=master)
[![LICENCE](https://img.shields.io/github/license/zhzluke96/TacoJs)](https://github.com/zhzLuke96/TacoJs)
[![size badge](https://img.shields.io/github/languages/code-size/zhzluke96/TacoJs?label=size)](https://github.com/zhzLuke96/TacoJs)
[![language](https://img.shields.io/github/languages/top/zhzluke96/TacoJs)](https://github.com/zhzLuke96/TacoJs)
[![version](https://img.shields.io/github/package-json/v/zhzluke96/TacoJs)](https://github.com/zhzLuke96/TacoJs)

🌮 mvvm framework, with 
- web component
- typescript

[![github star](https://img.shields.io/github/stars/zhzLuke96/TacoJs.svg?style=social)](https://github.com/zhzLuke96/TacoJs)

# Index
- [Taco](#taco)
- [Index](#index)
- [Overview](#overview)
- [Features](#features)
- [Usage](#usage)
  - [Browser](#browser)
  - [Webpack](#webpack)
- [Brower Support](#brower-support)
- [Related Efforts](#related-efforts)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [Todo](#todo)
- [LICENSE](#license)

# Overview
Taco 源于一个偷懒的想法，要是可以从一个对象直接映射到web app该多好。
```js
const taco = obj => html`${template}`;
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

now，一种船新的web开发模式来了，可能是你现在所见的`Tacojs`或是别的什么，甚至你自己也可以动手搞一搞。

# Features
- 标准： 以 webcomponent 为基础开发你的 app
- 工程： 通过 typescript 和相关工具链保证应用质量
- 轻量： API 轻量，快速上手
- 高效： 通过多种措施保障 dom 层渲染效率，大部分情况连 vnode 对象都不用出现

# Usage
## Browser
```html
<script src="https://unpkg.com/@tacopie/taco"></script>
```

## Webpack
```
npm install -D @tacopie/taco
```

/components/App.ts
```typescript
import { reactive, computed, h, Taco } from "@tacopie/taco"
// ...
import appTplHTML from "./appTpl.html"
export default class App implements Taco {
    template(): string {
        return appTplHTML
    }
    setup() {
        const state = reactive({
            count: 18,
            items: [
                "apple",
                "banana"
            ]
        })
        return {
            state
        }
    }
    @computed()
    get doubleCount() {
        return this.state.count * 2
    }
}
```
index.ts
```ts
import { createApp } from "@tacopie/taco"
import App from "./components/App"

createApp(new App()).mount($("appRoot"))
```

# Brower Support
Target environments are Chrome, Firefox, Safari.If you need to adapt a low-level browser environment, following preprocessors and polyfill are recommended:

- [babel](https://github.com/babel/babel) Babel is a compiler for writing next generation JavaScript. 
- [webcomponentsjs](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs) v1 spec polyfills

# Related Efforts
- [lit-element](https://github.com/Polymer/lit-element) A simple base class for creating fast, lightweight web components
- [vue](https://github.com/vuejs/vue) A progressive, incrementally-adoptable JavaScript framework for building UI on the web. 
- [react](https://github.com/facebook/react) A declarative, efficient, and flexible JavaScript library for building user interfaces.

# Maintainers
[@zhzluke96](https://github.com/zhzLuke96)

# Contributing
Feel free to dive in! [Open an issue](https://github.com/zhzLuke96/TacoJs/issues/new) or submit PRs.

TacoJs follows the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

# Changelog
fix: fixed issue that #comment node cannot be processed.

# Todo
I'd like to invite you to join [@tacopie](https://trello.com/tacopie2) on Trello. We use Trello to organize tasks, projects, due dates, and much more.

boards:
- [@tacopie/taco](https://trello.com/b/3hIi6dje/tacojs%F0%9F%8C%AE)
- ...

# LICENSE
GPL-V3.0