import { ref, Ref, isRef } from '@vue/reactivity';
import { currentHoxRef, setCurrentHoxRef } from '../core/hox';

export function useRef<T>(initial: T): Ref<T> {
    const hoxCtx = currentHoxRef();
    if (hoxCtx) {
        return hoxCtx.value as Ref<T>;
    }
    const theRef = ref(null);
    if (isRef(initial)) {
        theRef.value = initial.value;
    } else {
        theRef.value = initial;
    }
    setCurrentHoxRef({ value: theRef, type: useRef });
    return theRef;
}
