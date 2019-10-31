import { Compile } from "../compiler/compile"
import { reactive } from '../reactivity/reactivity';
import { propOptions } from '../poi/poi';
import { randID } from "../tools/id";

export const __global__ = reactive({})

interface mvvmOptions {
    manualCompile?: boolean
    disposable?: boolean
    props?: propOptions
    el?: Node
}

export class ViewModel {
    static $global = __global__
    $data: Object
    $compile: Compile
    $options: mvvmOptions
    $id: number

    constructor(data: Object, options: mvvmOptions = {}) {
        this.$id = randID()
        this.$data = Object.assign(data, { $global: __global__ })
        if (data["init"]) data["init"].call(this.$data)
        delete this.$data["init"]
        if (options.props) {
            const props = {}
            for (const key in options.props) {
                if (options.props.hasOwnProperty(key)) {
                    props[key] = options.props[key].default || ""
                }
            }
            this.$data["props"] = reactive(props)
        }
        for (const k of Object.keys(this.$data)) {
            if (typeof this.$data[k] === "function") {
                this.$data[k] = this.$data[k].bind(this.$data)
            }
        }
        this.$options = options
        if (!options.manualCompile || !options.el) {
            this.$compile = new Compile(this, options.el)
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


