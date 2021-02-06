import { enableTracking, pauseTracking } from '@vue/reactivity';
import { VNode } from './types';
import WDK from './WDK';

export const freeO = (o: any) =>
    o && typeof o === 'object' && Object.keys(o).forEach(k => delete o[k]);

export const destroyVNode = (v: VNode) => {
    v._dom && WDK.removeSelf(v._dom);
    v._dom && WDK.removeAllListener(v._dom);
    freeO(v);
};

export const isArr = Array.isArray;
export const arrify = <T>(x: T | T[]): T[] => (!x ? [] : isArr(x) ? x : [x]);

export const isThenable = (x: unknown) => x && typeof x['then'] === 'function';

export const once = <Args extends any[], Ret>(fn: (...args: Args) => Ret) => {
    let called = false;
    return (...args: Args) => {
        if (called) {
            return;
        }
        called = true;
        const ret = fn(...args);
        fn = null;
        return ret;
    };
};

export const skip = (f: () => any) => {
    pauseTracking();
    f();
    enableTracking();
};

export const resizeArr = (idx: number, arr: any[]) =>
    (arr.length = idx > arr.length ? idx : arr.length);
