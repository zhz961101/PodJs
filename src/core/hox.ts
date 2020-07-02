export const HoxMapSymbol = Symbol('HoxMap');
export const HoxMapIdxSymbol = Symbol('HoxMapIdx');
export const UnmountCallbackSymbol = Symbol('UnmountCallback');
export interface HoxCtx {
    [HoxMapIdxSymbol]: number;
    [HoxMapSymbol]: Map<number, HoxRef<unknown>>;
    [UnmountCallbackSymbol]: Array<() => void>;
    [key: string]: any;
}

export interface HoxRef<HoxReturnType> {
    type: (...any: any[]) => HoxReturnType;
    value: HoxReturnType;
}

export const NewHoxContext = () =>
    ({
        [HoxMapIdxSymbol]: 0,
        [HoxMapSymbol]: new Map(),
        [UnmountCallbackSymbol]: [],
    } as HoxCtx);

const HoxCtxStack = [] as HoxCtx[];
export const currentHoxCtx = (): HoxCtx | null =>
    (HoxCtxStack.length && HoxCtxStack[HoxCtxStack.length - 1]) || null;
export const currentHoxRef = (): HoxRef<unknown> | null => {
    const ctx = currentHoxCtx();
    if (ctx && ctx[HoxMapSymbol].has(ctx[HoxMapIdxSymbol])) {
        return ctx[HoxMapSymbol].get(ctx[HoxMapIdxSymbol]);
    }
    return null;
};
export const setCurrentHoxRef = (ref: HoxRef<unknown>) => {
    const ctx = currentHoxCtx();
    if (ctx) {
        ctx[HoxMapSymbol].set(ctx[HoxMapIdxSymbol], ref);
    }
};
export const pushHoxCtx = (ctx: HoxCtx) => {
    HoxCtxStack.push(ctx);
    ctx[HoxMapIdxSymbol] = 0; // reset Index to 0
};
export const popHoxCtx = (): HoxCtx | null => HoxCtxStack.pop() || null;

const NextIdleCall =
    requestIdleCallback ||
    ((fn => setTimeout(fn, 1)) as typeof requestIdleCallback);
const SafeCall = fn =>
    NextIdleCall(() => fn && typeof fn === 'function' && fn());

export const callUnmountCallback = () => {
    const ctx = currentHoxCtx();
    if (ctx) {
        [...ctx[UnmountCallbackSymbol]].forEach(refGetter =>
            SafeCall(SafeCall(refGetter)),
        );
        ctx[UnmountCallbackSymbol] = []; // reset to empty
    }
};

export const onUnmount = (fn: () => void) => {
    const ctx = currentHoxCtx();
    if (ctx) {
        ctx[UnmountCallbackSymbol].push(fn);
    }
    return { ctx };
};
