import { difineDirective } from "./compiler/directives"
import { effect, reactive, computed } from './reactivity/reactivity';
import { createElement, render } from "./vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "./vdom/any2v"
import { Store } from './store/store';
import { Poi, createApp } from './poi/poi';
import { ViewModel } from "./mvvm/mvvm";
import { h } from './tools/html';

if (window) {
    window["Poi"] = Poi
    Object.assign(Object.getPrototypeOf(window["Poi"]), {
        createApp,
        h,
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