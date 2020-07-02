import { ref, Ref } from '@vue/reactivity';
import { currentHoxRef, setCurrentHoxRef } from '../core/hox';

type Initializer<T> = T extends () => infer R ? R : T;
type StateSetter<T> = (v: T) => any;
type StateGetter<T> = () => T;
type StateReturnType<T> = [StateGetter<T>, StateSetter<T>, Ref<T>];

export function useState<T>(initial?: (() => T) | T): StateReturnType<T> {
    const hoxCtx = currentHoxRef();
    if (hoxCtx) {
        return hoxCtx.value as StateReturnType<T>;
    }
    const theRef = ref<T>();
    if (typeof initial === 'function') {
        theRef.value = (initial as () => T)();
    } else {
        theRef.value = initial;
    }
    const value = [() => theRef.value, (v: T) => (theRef.value = v), theRef];
    setCurrentHoxRef({ value, type: useState });
    return value as StateReturnType<T>;
}
