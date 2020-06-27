import { ref, Ref } from "@vue/reactivity";
import { currentHoxRef, setCurrentHoxRef } from "../hox";

type Initializer<T> = T extends any ? (T | (() => T)) : never;
type StateSetter<T> = (v: T) => any;
type StateGetter<T> = () => T;
type StateReturnType<T> = [StateGetter<T>, StateSetter<T>, Ref<T>];
export const useState = <T = any>(initial?: Initializer<T>): StateReturnType<T> => {
    const hoxCtx = currentHoxRef();
    if (hoxCtx) {
        return hoxCtx.value as StateReturnType<T>;
    }
    const theRef = ref();
    if (typeof initial === "function") {
        theRef.value = initial();
    } else {
        theRef.value = initial;
    }
    const value = [() => theRef.value as T, (v: T) => theRef.value = v, theRef];
    setCurrentHoxRef({ value, type: useState });
    return value as StateReturnType<T>;
};
