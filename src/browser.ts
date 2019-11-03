import { difineDirective } from "./compiler/directives";
import { ViewModel } from "./mvvm/mvvm";
import { createApp } from "./poi/poi";
import { computed, effect, reactive } from "./reactivity/reactivity";
import { Store } from "./store/store";
import { h } from "./tools/html";
import { Dom2Vnode, HTML2Vdom } from "./vdom/any2v";
import { createElement, render } from "./vdom/vdom";

declare global {
    interface Window {
        Poi: object;
    }
}

if (window) {
    window.Poi = class { };
    Object.assign(Object.getPrototypeOf(window.Poi), {
        createApp,
        h,
        ViewModel,
        h2v: HTML2Vdom,
        d2v: Dom2Vnode,
        createElement,
        render,
        difineDirective,
        Store,
        computed,
        reactive,
        effect,
    });
}
