
import { Watcher } from "./watcher"
import { nxtTickRun } from './nxtTick'

export function observe(data: Object): Observe {
    if (typeof data != "object") return void (0);
    return new Observe(data)
}

class Observe {
    data: Object

    constructor(data: Object) {
        this.data = data
        this.walk(data)
    }

    walk(data: Object) {
        Object.keys(data).forEach(k => {
            this.convert(k, data[k])
        })
    }

    convert(key: string, val: any) {
        this.defineReactive(this.data, key, val)
    }

    defineReactive(data: Object, key: string, value: any) {
        let dep = new Dep()
        let obs = observe(value)
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: false,
            get() {
                if (Dep.target) {
                    dep.depend()
                }
                return value
            },
            set(newValue) {
                if (newValue == value) return
                value = newValue;
                obs = observe(newValue)
                nxtTickRun(dep.notify, dep)
                // dep.notify()
            }
        })
    }
}

let depid = 0

export class Dep {
    static target: Watcher
    subs: Watcher[]
    id: number

    constructor() {
        this.subs = []
        this.id = depid++
    }

    addSub(sub: Watcher) {
        this.subs.push(sub)
    }
    depend() {
        Dep.target.addDep(this)
    }
    removeSub(sub: Watcher) {
        let index = this.subs.indexOf(sub)
        if (index != -1) {
            this.subs.splice(index, 1)
        }
    }
    notify() {
        this.subs.forEach(sub => sub.updata())
    }
}
