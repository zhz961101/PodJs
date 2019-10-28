import { Compile } from "./compile"
import { observe } from './observer'
import { createElement, render } from "./vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "./vdom/any2v"

// __DEV__
if (window) window["h2v"] = HTML2Vdom
if (window) window["d2v"] = Dom2Vnode
if (window) window["createElement"] = createElement
if (window) window["render"] = render

export class ViewModel {
    $data: Object
    $compile: Compile

    constructor(el: Node, data: Object, scoped: boolean = false) {
        let _data = this.$data = data
        Object.keys(_data).forEach(key => {
            this._proxyData(key)
        });
        observe(_data)
        if (!scoped) {
            this.$compile = new Compile(this, el)
        }
    }

    _get(exp: string): any {
        let arr = exp.trim().split(".")
        let value = this
        arr.forEach(vexp => value = value[vexp])
        return value
    }

    getter(exp: string): Function {
        let arr = exp.trim().split(".")
        return (): any => {
            let value = this
            arr.forEach(vexp => value = value[vexp])
            return value
        }
    }

    _set(exp: string, newValue: any) {
        let val = this;
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
            let val = this;
            arr.forEach((k, i) => {
                if (i < arr.length - 1) {
                    val = val[k];
                } else {
                    val[k] = newValue;
                }
            });
        }
    }

    _proxyData(key: any) {
        if (typeof key == "object" && !(key instanceof Array)) {
            this._proxyData(key)
        }
        let _this = this
        Object.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return _this.$data[key];
            },
            set: function proxySetter(newVal) {
                _this.$data[key] = newVal;
            }
        })
    }
}

if (window) {
    window["ViewModel"] = ViewModel
}
