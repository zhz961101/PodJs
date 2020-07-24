import { effect } from '@vue/reactivity';
import { currentHoxCtx, UnmountCallbackSymbol } from '../core/hox';

interface IUseEffect {
    (effectFn: () => void): void;
    (effectFn: () => () => void): void;
}

export const useEffect: IUseEffect = effectFn => {
    const unmountRef = Object.create(null) as { value: any };
    unmountRef.value = null;
    requestIdleCallback(() => {
        effect(() => {
            unmountRef.value = effectFn() || null;
        });
    });
    const ctx = currentHoxCtx();
    if (ctx) {
        ctx[UnmountCallbackSymbol].push(() => unmountRef.value);
    }
    return { ctx, unmountRef };
};
