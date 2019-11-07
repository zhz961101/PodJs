import { defineComponent } from "./compiler/compile";
import { defineDirective } from "./compiler/directives";
import { defineStatement } from "./compiler/statement";
import { __Global__, ViewModel } from "./mvvm/mvvm";
import { computed, effect, reactive } from "./reactivity/reactivity";
import { Store } from "./store/store";
import { createApp } from "./taco/taco";
import { h, HTMLExtender } from "./tools/html";
import { VFragment } from "./vdom/frag";
import { createElement, render } from "./vdom/vdom";

export const TacoExports = {
    defineStatement,
    defineDirective,
    defineComponent,
    effect,
    reactive,
    computed,
    createElement,
    render,
    Store,
    createApp,
    ViewModel,
    __Global__,
    h,
    HTMLExtender,
    VFragment,
};
