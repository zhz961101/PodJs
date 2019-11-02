import { baseHandler } from './basehandler';
import { nextTick } from './nxtTick';

type Deps = Set<Effect>

export interface Effect {
    (): any
    deps: Array<Deps>
    // active: boolean
    lazy?: boolean
    computed?: boolean
    scheduler?: (run: Function) => void
}

// object => Proxy<object>
const raw2Proxy = new WeakMap<object, any>()
// Proxy<object> => object
const proxy2Raw = new WeakMap<any, object>()

let effectStack: Array<Effect> = []
let targetMap = new WeakMap<object, WeakMap<String, Deps>>()

export function getToRaw(value: object): object {
    return proxy2Raw.get(value) || value
}

export function reactive<T extends object>(target: T, upper: object = null): T {
    let observed
    if (observed = raw2Proxy.get(target)) {
        return observed
    }
    if (proxy2Raw.get(target)) {
        return target
    }
    // ------ cacher ----- 👆
    observed = new Proxy(target, baseHandler(upper))
    // ------ cacher ----- 👇
    raw2Proxy.set(target, observed)
    proxy2Raw.set(observed, target)
    return observed
}

export function trigger(target: object, key: string) {
    const depsMap = targetMap.get(target)
    if (depsMap === undefined) return
    const effects = new Set()
    const computedRunners = new Set()
    if (key) {
        let deps = depsMap.get(key)
        if (!deps) return
        deps.forEach(effect => effect.computed ? computedRunners.add(effect) : effects.add(effect))
    }
    const run = (e: Effect) => {
        if (e.scheduler) {
            e.scheduler(e)
        } else {
            nextTick(e)
        }
    }
    // Important: computed effects 需要提前运行
    computedRunners.forEach(run)
    effects.forEach(run)
}

export function track(target: object, key: string) {
    let effect = effectStack[effectStack.length - 1]
    if (!effect) return

    let depsMap = targetMap.get(target)
    if (depsMap === undefined) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if (dep === undefined) {
        dep = new Set()
        depsMap.set(key, dep)
    }
    if (!dep.has(effect)) {
        dep.add(effect)
        effect.deps.push(dep)
    }
}

interface EffectOptions {
    lazy?: boolean,
    computed?: boolean
    scheduler?: () => void
}

export function effect(fn: Function, options: EffectOptions = {}) {
    let e = createRectiveEffect(fn, options)
    if (!options.lazy)
        e()
    return e
}

function createRectiveEffect(fn: Function, options: EffectOptions) {
    const effect = (...args) => run(effect, fn, args)
    effect.deps = []
    effect.computed = options.computed
    effect.lazy = options.lazy
    effect.scheduler = options.scheduler
    effect.active = false
    return effect
}

function run(effect: Effect, fn: Function, args: any[]): any {
    if (effectStack.indexOf(effect) === -1) {
        try {
            effectStack.push(effect)
            return fn(...args)
        } finally {
            effectStack.pop()
        }
    }
}

export function computed(fn: Function, options: object = {}) {
    let dirty = true
    let value: any
    const runner = effect(fn, Object.assign({
        computed: true,
        lazy: true,
        scheduler() {
            dirty = true
            // 触发修改，如果有副作用则顺序调用
            trigger(ret, "value")
        }
    }, options))
    const ret = {
        effect: runner,
        get value() {
            if (dirty) {
                value = runner()
                dirty = false
            }
            return value
        }
    }
    return reactive(ret)
    // return ret
}
