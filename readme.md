# 🔮PoiJs

![LICENSE badge](https://img.shields.io/badge/license-GPL3.0-blue)
![size badge](https://img.shields.io/badge/size-10K-green)

mvvm framework.

# Index
- [🔮PoiJs](#%f0%9f%94%aepoijs)
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
come soon

# Changelog
- reactivity
- 移除 observe && watcher
- nextTickEffect

# Todo
- [x] refactoring
- [x] proxy reactivity （vue-next 实现）解决深层依赖问题
- [ ] proxy 父级对象依赖
- [ ] es6+ 语法
- [ ] 复用v2b版本 web component 实现
- [ ] 垃圾回收 Dep Watcher
- [ ] Myers' diff for diff vdom
  > 增加dom复用减少GC
- [ ] patch 分离，从diff中分离patch操作
- [ ] 异步渲染 (v1b协程实现)
- [ ] 更多注释，更多示例
- [ ] 自定义指令

# LICENSE
GPL-V3.0