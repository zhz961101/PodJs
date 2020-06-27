import { effect } from "@vue/reactivity";
import { currentHoxCtx, UnmountCallbackSymbol } from "../hox";

type IUseEffect = {
    (effectFn: () => void): void;
    (effectFn: () => () => void): void;
}

export const useEffect: IUseEffect = (effectFn) => {
    const unmountRef = Object.create(null) as { value: any };
    unmountRef.value = null;
    effect(() => {
        unmountRef.value = effectFn() || null;
    })
    const ctx = currentHoxCtx();
    if (ctx) {
        ctx[UnmountCallbackSymbol].push(() => unmountRef.value);
    }
    return { ctx, unmountRef };
}