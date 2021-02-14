![taco](https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/taco_1f32e.png)

# Taco

[![Build Status](https://travis-ci.org/zhzLuke96/TacoJs.svg?branch=master)](https://travis-ci.org/zhzLuke96/TacoJs)
[![Coverage Status](https://coveralls.io/repos/github/zhzLuke96/TacoJs/badge.svg?branch=master)](https://coveralls.io/github/zhzLuke96/TacoJs?branch=master)
[![LICENCE](https://img.shields.io/github/license/zhzluke96/TacoJs)](https://github.com/zhzLuke96/TacoJs)
[![size badge](https://img.shields.io/github/languages/code-size/zhzluke96/TacoJs?label=size)](https://github.com/zhzLuke96/TacoJs)
[![language](https://img.shields.io/github/languages/top/zhzluke96/TacoJs)](https://github.com/zhzLuke96/TacoJs)
[![version](https://img.shields.io/github/package-json/v/zhzluke96/TacoJs)](https://github.com/zhzLuke96/TacoJs)

🥩 + 🥔 + 🍓 = 🌮;

[![github star](https://img.shields.io/github/stars/zhzLuke96/TacoJs.svg?style=social)](https://github.com/zhzLuke96/TacoJs)

# What is Taco

Next-generation Web-App-Framework. 💫Reactivity, 📐Functional, and 🌮All-in-JS.

# Index

- [Taco](#taco)
- [What is Taco](#what-is-taco)
- [Index](#index)
- [Quick Start](#quick-start)
- [Taco Palygroud](#taco-palygroud)
- [Examples](#examples)
- [Brower Support](#brower-support)
- [Related Efforts](#related-efforts)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [Todo](#todo)
- [LICENSE](#license)

# Quick Start

ESM
```html
<!DOCTYPE html>
<html lang="en">
  <div id="root"></div>
  <script type="module">
import * as Taco from 'https://unpkg.com/@tacopie/taco?module';

const {
    useState,
    render,
} = Taco;

// 一个实时JSX的库
import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(Taco.h);

const App = () => {
    const css = { margin: '.5rem', padding: '1rem', 'font-weight': 900 };
    const [state] = useState({name: "🌮TacoJS"});
    return html`<h3>Hello, ${state.name}</h3>`
}

render(App, document.querySelector('#root'));
  </script>
</html>
```

# Taco Palygroud

[try it now!](http://zhzluke96.github.io/tacojs-playground/)

# Examples

In [this repository](https://github.com/zhzLuke96/TacoJs-examples) you can find example projects.

> use Typescript/TSX/Webpack

# Brower Support

Target environments are Chrome, Firefox, Safari.If you need to adapt a low-level browser environment, following preprocessors and polyfill are recommended:

-   [babel](https://github.com/babel/babel) Babel is a compiler for writing next generation JavaScript.
-   [webcomponentsjs](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs) v1 spec polyfills

# Related Efforts

-   [lit-element](https://github.com/Polymer/lit-element) A simple base class for creating fast, lightweight web components
-   [vue](https://github.com/vuejs/vue) A progressive, incrementally-adoptable JavaScript framework for building UI on the web.
-   [react](https://github.com/facebook/react) A declarative, efficient, and flexible JavaScript library for building user interfaces.

# Maintainers

[@zhzluke96](https://github.com/zhzLuke96)

# Contributing

Feel free to dive in! [Open an issue](https://github.com/zhzLuke96/TacoJs/issues/new) or submit PRs.

TacoJs follows the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

# Todo

I'd like to invite you to join [@tacopie](https://trello.com/tacopie2) on Trello. We use Trello to organize tasks, projects, due dates, and much more.

boards:

-   [@tacopie/taco](https://trello.com/b/3hIi6dje/tacojs%F0%9F%8C%AE)
-   ...

# LICENSE

GPL-V3.0
