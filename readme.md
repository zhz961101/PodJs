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
没有永恒的不变。

# Features

components
```ts
const Content = (
  { aha = '🤖' },
  children
) => html`${aha}${children}`;
const App = ({
  { SomeProps }
}) => html`👈<${Content} aha=${'🦄'}>Hello World!<//>👉`
```

ES2020
```ts
const App = () => {
  const Timeing = useGenerator(async function* () {
      while (true) {
          yield new Date().toTimeString();
          await new Promise((r) => setTimeout(r, 1000));
      }
  });
  return html`<span>${Timeing}</span>`
}
```

auto dependence (`@vue-next/reactivity`)
```ts
const App = () => {
  const counter = useRef(0);
  return html`<div>
  <button onclick=${() => counter.value ++}>+</button>
  count: ${counter}
  <button onclick=${() => counter.value --}>-</button>
  </div>`
}
```

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
import {html, useState} from '@tacopie/taco';

const App = (props, children) => {
  const { format = x => Number(x) } = props;
  const [_g, _s, count] = useState(1);
  return html`
    <div>
      <header>
        ${children}
      </header>
      <button onclick=${() => count--}>-1</button>
      ${() => format(count.value)}
      <button onclick=${() => count++}>+1</button>
    </div>
  `;
};
```

index.ts

```ts
import { cn as nzh } from 'nzh';
import {mount} from '@tacopie/taco';
import App from './components/App';

mount($('app'), html`<${App} format=${nzh.encodeB}>Hello World.<//>`);
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

feat: 重写.

# Todo

I'd like to invite you to join [@tacopie](https://trello.com/tacopie2) on Trello. We use Trello to organize tasks, projects, due dates, and much more.

boards:

- [@tacopie/taco](https://trello.com/b/3hIi6dje/tacojs%F0%9F%8C%AE)
- ...

# LICENSE

GPL-V3.0
