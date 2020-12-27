import { customRef, effect, Ref, ref, toRaw } from '@vue/reactivity';
import { Component } from './core';

// 👇 UTILS
const skip = (f: () => any) => Promise.resolve().then(f);

const resizeArr = (idx: number, arr: any[]) =>
    (arr.length = idx > arr.length ? idx : arr.length);
// 👆 UTILS

const HOOKS = (Symbol('HOOKS') as unknown) as string;
export const useInstance = () => {
    const ins = Component.CurrentInstance;
    if (!(HOOKS in ins.context)) {
        ins.context[HOOKS] = [];
    }
    return ins;
};
const hoxPrepare = <T>() => {
    const ins = useInstance();
    const idx = Component.HooksIdx++;
    const hooks = ins.context[HOOKS];
    return [
        hooks[idx] as T,
        (x: T): T => {
            resizeArr(idx, hooks);
            return (hooks[idx] = x);
        },
        ins,
        idx,
    ];
};
export const useCtx = () => {
    const ins = useInstance();
    const { mountCallbacks, unmountCallbacks, ...rest } = ins.context;
    return rest;
};
export const useOnmount = (cb: (c: Component) => void) => {
    const [seted, setter, ins, idx] = hoxPrepare();
    if (seted) {
        return;
    }
    ins.context.mountCallbacks.push(cb);
    setter(true);
};
export const useUnmount = (cb: (c: Component) => void) => {
    const [seted, setter, ins, idx] = hoxPrepare();
    if (seted) {
        return;
    }
    ins.context.unmountCallbacks.push(cb);
    setter(true);
};
export const useRef = <T>(inital: T | (() => T)) => {
    const [ret, setter] = hoxPrepare();
    if (ret) {
        return ret as Ref<T>;
    }
    const refT = ref<T>();
    if (typeof inital === 'function') {
        refT.value = (inital as () => T)();
    } else {
        refT.value = inital as T;
    }
    setter(refT);
    return refT;
};
export type Ptr<T> = Ref<T>;
export type Ptrof<T> = T extends Ptr<infer U> ? U : never;
// const ptr = <T>(value?: T): Ptr<T> => {
//     let insPtr = { value };
//     return ({
//         __v_isRef: true,
//         get value() {
//             track(insPtr, TrackOpTypes.GET, 'value');
//             return insPtr.value;
//         },
//         set value(nextValue: T) {
//             insPtr.value = nextValue;
//             trigger(insPtr, TriggerOpTypes.SET, 'value');
//         },
//     } as unknown) as Ptr<T>;
// };
export const ptr = <T>(value?: T): Ptr<T> =>
    customRef((track, trigger) => ({
        get() {
            track();
            return toRaw(value);
        },
        set(newValue) {
            value = newValue;
            trigger();
        },
    }));
export const usePtr = <T>(inital: T | (() => T)) => {
    const [ret, setter] = hoxPrepare();
    if (ret) {
        return ret as Ptr<T>;
    }
    const pt = ptr<T>();
    if (typeof inital === 'function') {
        pt.value = (inital as () => T)();
    } else {
        pt.value = inital as T;
    }
    return pt;
};

export const useEffect = (
    eff: () => undefined | (() => void),
    options?: any,
) => {
    const [inited, setter, ins] = hoxPrepare();
    if (inited) {
        return;
    }
    setter(true);
    effect(() => {
        const maybeFn = eff();
        if (typeof maybeFn === 'function') {
            ins.context.unmountCallbacks.push(maybeFn);
        }
    }, options);
};
export const useWatch = <WatchRet>(
    watcher?: () => WatchRet,
    eff?: (current: WatchRet | null, last: WatchRet | null) => void,
    options?: any,
) => {
    const [inited, setter, ins] = hoxPrepare();
    if (inited) {
        return;
    }
    setter(true);
    let lastRet = null;
    effect(() => {
        const watchRet = watcher && watcher();
        skip(() => {
            const maybeFn = eff(watchRet, lastRet);
            lastRet = watchRet;
            if (typeof maybeFn === 'function') {
                ins.context.unmountCallbacks.push(maybeFn);
            }
        });
    }, options);
};
export const useMemo = <T>(factory: () => T, depEff?: () => void) => {
    const [ret, setter, ins, idx] = hoxPrepare();
    if (ret) {
        return ret as T;
    }
    if (!depEff) {
        return setter(factory()) as T;
    }
    effect(() => {
        depEff();
        skip(() => setter(factory()));
    });
    return setter(factory()) as T;
};
export const useCallback = <CB extends Function>(cb: CB, depEff?: () => void) =>
    useMemo(() => cb, depEff);

type Reducer<ReducerState, ReducerAction> = (
    state: ReducerState,
    action: ReducerAction,
) => ReducerState;

export const useReducer = <
    ReducerState,
    ReducerAction extends number | string | boolean
>(
    reducer: Reducer<ReducerState, ReducerAction>,
    initialState: ReducerState,
    initialAction: ReducerAction,
) => {
    let [ret, setter, ins, idx] = hoxPrepare();
    if (ret) {
        ret = setter({
            state: initialAction
                ? reducer(initialState, initialAction)
                : initialState,
        });
    }
    return [
        ret.state,
        useCallback((action: ReducerAction) => {
            setter({
                state: reducer(ret.state, action),
            });
        }),
    ];
};
// TODO: 没什么意义其实
export const useState = (): any => {};

///////////////////////////////////////////

type ErrLike = Error & Record<string | number | symbol, any>;

export const useTry = () => {
    const ins = useInstance();
    return function Try(cb: () => void) {
        try {
            cb();
        } catch (error) {
            ins.throwError(error, ins);
        }
    };
};

export const useCatcher = (
    catcher: (err: ErrLike, source: Component) => void,
) => {
    const ins = useInstance();
    ins.errorCatcher = catcher;
};

export const useErrThrower = (): ((
    err: ErrLike,
    source: Component,
) => void) => {
    const ins = useInstance();
    return ins.throwError.bind(ins);
};

export const useChannel = () => {
    const currentResolver = useRef(() => (...args: any[]) => void 0);
    const chan = useRef(Promise.resolve());
    const reset = (msg?: any) => {
        currentResolver.value(msg);
        chan.value = new Promise(
            resolve => (currentResolver.value = (...args) => resolve(...args)),
        );
    };
    reset();
    return [chan, reset] as const;
};

///////////////////////////////////////////

export const useCtxVal = <Val = any>(key: string | number | symbol) => {
    const ins = useInstance();
    return ins.getContextValue(key) as Val | null;
};
