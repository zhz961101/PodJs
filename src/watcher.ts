import { ViewModel } from "./mvvm"
import { Dep } from './observer'

function parseGetter(exp: string): Function {
    if (/[^\w.$]/.test(exp)) return () => "";
    let exps = exp.split('.');
    return function (obj) {
        for (let i = 0, len = exps.length; i < len; i++) {
            if (!obj) return;
            obj = obj[exps[i]];
        }
        return obj;
    }
}

export class Watcher {
    vm: ViewModel
    cb: Function
    exp: string
    value: any
    depIds: number[]
    gatter: Function

    constructor(vm: ViewModel, exp: string, cb: Function) {
        this.vm = vm
        this.exp = exp
        this.cb = cb
        this.depIds = []
        this.gatter = parseGetter(exp)

        this.value = this.get()
    }

    updata() {
        this.run()
    }

    addDep(dep: Dep) {
        if (this.depIds.indexOf(dep.id) == -1) {
            dep.addSub(this)
            this.depIds.push(dep.id)
        }
    }

    get(): any {
        Dep.target = this
        let value = this.gatter.call(this.vm, this.vm)
        Dep.target = null
        return value
    }

    run() {
        const value = this.vm._get(this.exp)
        if (value != this.value) {
            this.value = value
            this.cb.call(this.vm, value)
        }
    }
}