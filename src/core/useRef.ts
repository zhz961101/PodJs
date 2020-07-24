import { isRef, ref, Ref, toRaw } from '@vue/reactivity';
import { currentHoxRef, setCurrentHoxRef } from '../core/hox';
import { isFunc } from './common';

export function useRef<T>(initial?: (() => T) | T): Ref<T> {
    const hoxCtx = currentHoxRef();
    if (hoxCtx) {
        return hoxCtx.value as Ref<T>;
    }
    const theRef = ref(null);
    if (isRef(initial)) {
        theRef.value = toRaw(initial.value);
    } else if (isFunc(initial)) {
        theRef.value = initial();
    } else {
        theRef.value = initial;
    }
    setCurrentHoxRef({ value: theRef, type: useRef });
    return theRef;
}
