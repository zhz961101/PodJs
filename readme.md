# Poi

[![Build Status](https://travis-ci.org/zhzLuke96/PoiJs.svg?branch=master)](https://travis-ci.org/zhzLuke96/PoiJs)
[![Coverage Status](https://coveralls.io/repos/github/zhzLuke96/PoiJs/badge.svg?branch=master)](https://coveralls.io/github/zhzLuke96/PoiJs?branch=master)
![LICENSE badge](https://img.shields.io/badge/license-GPL3.0-blue)
![size badge](https://img.shields.io/badge/size-15K-green)


mvvm framework, with 
- web component
- typescript

# Index
- [Poi](#poi)
- [Index](#index)
- [Background](#background)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Changelog](#changelog)
- [Todo](#todo)
- [LICENSE](#license)

# Background
Poi 源于一个偷懒的想法，要是可以从一个对象直接映射到web app该多好。
```js
const poi = obj => html`${template}`;
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
come soon

# Install
```
git clone --depth=1 https://github.com/zhzLuke96/PoiJs.git; \
cd PoiJs; npm i; npm run all;
```

```
# development pack
npm run dev
# development pack with --watch mode
npm run dev:w

# build pack
npm run build
# build pack with --watch mode
npm run build:w
```

# Usage
> 现目前还未完成，详见 examples

```typescript
class App extends Poi {
    constructor() {
        super("app-root", {...})
    }

    template(): string | Vnode {
        // return `...`
        return createElement('div',[...])
    }

    setup() {
        const state = reactive({
            msg: "hello world!",
            count: 18,
            items: [
                "apple",
                "banana"
            ],
            apiURL: "///"
        })
        return {
            state
        }
    }

    @computed()
    get doubleCount() {
        return this.state.count * 2
    }

    @cache(1000 * 60 * 60)  // 1 hour cache
    @catchTry(1000, 5)      // error retry
    async appInfo() {
        let resp = await fetch(this.state.apiURL)
        return resp.json()
    }

    @debounce(500)
    async login() {
        /*
         * code
         */
    }

    @watch("state.items")
    itemsChange(newValue: Arrya<string>) {
        console.log("items change",newValue)
    }
}
```

# Changelog
docs: 修改 examples

- 修改 shopping-cart 示例代码
- 增加 *.d.ts 文件的编译

# Todo
- [x] refactoring
- [x] proxy reactivity （vue-next 实现）解决深层依赖问题
- [x] proxy 父级对象依赖通知
- [ ] 减少无关依赖重绘，脏检查
- [x] 复用v2b版本 web component 实现
- [x] es6+ 语法
- [x] 简单无head指令
- [ ] 局部指令 局部组件
- [ ] 装饰器
- [ ] 插件 和 hooks
- [ ] patch 分离，从diff中分离patch操作
- [ ] vnode render after 垃圾收集
- [ ] Myers' diff for diff vdom
  > 增加dom复用减少GC
- [ ] 异步渲染 (v1b协程实现)
- [ ] 更多注释，示例，文档
- [ ] 自定义指令

# LICENSE
GPL-V3.0