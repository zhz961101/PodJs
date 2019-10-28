import { Compile } from "./compile"
// import { observe } from './observer'
import { reactive } from './reactivity/reactivity';

// __DEV__
import { createElement, render } from "./vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "./vdom/any2v"
if (window) window["h2v"] = HTML2Vdom
if (window) window["d2v"] = Dom2Vnode
if (window) window["createElement"] = createElement
if (window) window["render"] = render

export class ViewModel {
    $data: Object
    $compile: Compile

    constructor(el: Node, data: Object, scoped: boolean = false) {
        this.$data = reactive(data)
        if (!scoped) {
            this.$compile = new Compile(this, el)
        }
    }

    _get(exp: string): any {
        let arr = exp.trim().split(".")
        let value = this.$data
        arr.forEach(vexp => value = value[vexp])
        return value
    }

    getter(exp: string): Function {
        let arr = exp.trim().split(".")
        return (): any => {
            let value = this.$data
            arr.forEach(vexp => value = value[vexp])
            return value
        }
    }

    _set(exp: string, newValue: any) {
        let val = this.$data;
        let arr = exp.trim().split('.')
        arr.forEach((k, i) => {
            if (i < arr.length - 1) {
                val = val[k];
            } else {
                val[k] = newValue;
            }
        });
    }

    setter(exp: string): Function {
        let arr = exp.trim().split('.')
        return newValue => {
            let val = this.$data;
            arr.forEach((k, i) => {
                if (i < arr.length - 1) {
                    val = val[k];
                } else {
                    val[k] = newValue;
                }
            });
        }
    }
}

if (window) {
    window["ViewModel"] = ViewModel
}
