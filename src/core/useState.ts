import { isRef, ref, Ref, toRaw } from '@vue/reactivity';
import { isFunc } from './common';
import { currentHoxRef, setCurrentHoxRef } from './hox';

type StateSetter<T> = (v: T) => any;
type StateGetter<T> = () => T;
type StateReturnType<T> = [StateGetter<T>, StateSetter<T>, Ref<T>];

export function useState<T>(initial?: (() => T) | T): StateReturnType<T> {
    const hoxCtx = currentHoxRef();
    if (hoxCtx) {
        return hoxCtx.value as StateReturnType<T>;
    }
    const theRef = ref<T>();
    if (isRef(initial)) {
        theRef.value = toRaw(initial.value) as T;
    } else if (isFunc(initial)) {
        theRef.value = initial();
    } else {
        theRef.value = initial;
    }
    const value = [() => theRef.value, (v: T) => (theRef.value = v), theRef];
    setCurrentHoxRef({ value, type: useState });
    return value as StateReturnType<T>;
}
