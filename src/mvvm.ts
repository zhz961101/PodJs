import { Compile } from "./compile"
// import { observe } from './observer'
import { reactive, computed } from './reactivity/reactivity';

// __DEV__
import { createElement, render } from "./vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "./vdom/any2v"
import { Store } from './store/store';
if (window) window["h2v"] = HTML2Vdom
if (window) window["d2v"] = Dom2Vnode
if (window) window["createElement"] = createElement
if (window) window["render"] = render
if (window) window["reactive"] = reactive
if (window) window["Store"] = Store

const global = reactive({})

interface mvvmOptions {
    manualComple?: boolean
    disposable?: boolean
}

export class ViewModel {
    static $global = global
    $data: Object
    $compile: Compile
    $options: mvvmOptions

    constructor(el: Node, data: Object, options: mvvmOptions = {}) {
        this.$data = reactive(Object.assign(data, { $global: global }))
        if (data["init"]) data["init"].call(this.$data)
        this.$options = options
        if (!options.manualComple) {
            this.$compile = new Compile(this, el)
        }
    }

    _get(exp: string): any {
        let arr = exp.trim().split(".")
        let value = this.$data
        try {
            arr.forEach(vexp => value = value[vexp])
        } catch{
            return void 0
        }
        return value
    }

    getter(exp: string): Function {
        let arr = exp.trim().split(".")
        return (): any => {
            let value = this.$data
            try {
                arr.forEach(vexp => value = value[vexp])
            } catch {
                return void 0
            }
            return value
        }
    }

    _set(exp: string, newValue: any) {
        let val = this.$data;
        let arr = exp.trim().split('.')
        try {
            arr.forEach((k, i) => {
                if (i < arr.length - 1) {
                    val = val[k];
                } else {
                    val[k] = newValue;
                }
            });
        } catch {
            return void 0
        }
    }

    setter(exp: string): Function {
        let arr = exp.trim().split('.')
        return newValue => {
            let val = this.$data;
            try {
                arr.forEach((k, i) => {
                    if (i < arr.length - 1) {
                        val = val[k];
                    } else {
                        val[k] = newValue;
                    }
                });
            } catch {
                return void 0
            }
        }
    }
}

if (window) {
    window["ViewModel"] = ViewModel
}


