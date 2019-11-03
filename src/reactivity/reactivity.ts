import { baseHandler } from "./basehandler";
import { nextTick } from "./nxtTick";

type Deps = Set<Effect>;

export interface Effect {
    (): any;
    deps: Deps[];
    // active: boolean
    lazy?: boolean;
    computed?: boolean;
    scheduler?: (run: () => void) => void;
}

// object => Proxy<object>
const raw2Proxy = new WeakMap<object, any>();
// Proxy<object> => object
const proxy2Raw = new WeakMap<any, object>();

const effectStack: Effect[] = [];
const targetMap = new WeakMap<object, Map<string, Deps>>();

export function getToRaw(value: object): object {
    return proxy2Raw.get(value) || value;
}

export function reactive<T extends object>(target: T, upper: object = null): T {
    let observed;
    observed = raw2Proxy.get(target);
    if (observed) {
        return observed;
    }
    if (proxy2Raw.get(target)) {
        return target;
    }
    // ------ cacher ----- 👆
    observed = new Proxy(target, baseHandler(upper));
    // ------ cacher ----- 👇
    raw2Proxy.set(target, observed);
    proxy2Raw.set(observed, target);
    return observed;
}

export function trigger(target: object, key: string) {
    const depsMap = targetMap.get(target);
    if (depsMap === undefined) { return; }
    const effects = new Set();
    const computedRunners = new Set();
    if (key) {
        const deps = depsMap.get(key);
        if (!deps) { return; }
        /* tslint:disable */
        deps.forEach((effect) => effect.computed ? computedRunners.add(effect) : effects.add(effect));
    }
    const run = (e: Effect) => {
        /* tslint:enable */
        if (e.scheduler) {
            e.scheduler(e);
        } else {
            nextTick(e);
        }
    };
    // Important: computed effects 需要提前运行
    computedRunners.forEach(run);
    effects.forEach(run);
}
/* tslint:disable */
export function track(target: object, key: string) {
    const effect = effectStack[effectStack.length - 1];
    if (!effect) { return; }

    let depsMap = targetMap.get(target);
    if (depsMap === undefined) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (dep === undefined) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    if (!dep.has(effect)) {
        dep.add(effect);
        effect.deps.push(dep);
    }
}
/* tslint:enable */
interface EffectOptions {
    lazy?: boolean;
    computed?: boolean;
    scheduler?: () => void;
}

export function effect(fn: () => any, options: EffectOptions = {}) {
    const e = createRectiveEffect(fn, options);
    if (!options.lazy) {
        e();
    }
    return e;
}
/* tslint:disable */
function createRectiveEffect(fn: () => any, options: EffectOptions) {
    const effect = (...args) => run(effect, fn, args);
    effect.deps = [];
    effect.computed = options.computed;
    effect.lazy = options.lazy;
    effect.scheduler = options.scheduler;
    effect.active = false;
    return effect;
}

function run(effect: Effect, fn: (...ags: any[]) => any, args: any[]): any {
    if (effectStack.indexOf(effect) === -1) {
        try {
            effectStack.push(effect);
            return fn(...args);
        } finally {
            effectStack.pop();
        }
    }
}
/* tslint:enable */
export function computed(fn: () => any, options: object = {}) {
    let dirty = true;
    let value: any;
    const runner = effect(fn, Object.assign({
        computed: true,
        lazy: true,
        scheduler() {
            dirty = true;
            // 触发修改，如果有副作用则顺序调用
            trigger(ret, "value");
        },
    }, options));
    const ret = {
        effect: runner,
        get value() {
            if (dirty) {
                value = runner();
                dirty = false;
            }
            return value;
        },
    };
    return reactive(ret);
    // return ret
}
