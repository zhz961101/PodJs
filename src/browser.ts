import { difineDirective } from "./compiler/compile"
import { effect, reactive, computed } from './reactivity/reactivity';
import { createElement, render } from "./vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "./vdom/any2v"
import { Store } from './store/store';
import { Poi } from './component/create';
import { ViewModel } from "./mvvm/mvvm";
import { html } from './tools/html';

if (window) {
    window["Poi"] = Poi
    Object.assign(Object.getPrototypeOf(window["Poi"]), {
        tools: { html },
        mvvm: {
            ViewModel,
        },
        vdom: {
            h2v: HTML2Vdom,
            d2v: Dom2Vnode,
            createElement,
            render
        },
        compiler: {
            difineDirective
        },
        store: {
            Store,
        },
        reactivty: {
            computed,
            reactive,
            effect
        }
    })
}