const __HOX__DEBUGGER__ = false;

const debugLog = (name: string, ctx: HoxCtx) => {
    const table = {
        idx: ctx[HoxMapIdxSymbol],
        'map.size': ctx[HoxMapSymbol].size,
        'unmount.length': ctx[UnmountCallbackSymbol].length,
        'stack.length': HoxCtxStack.length,
    };
    console.groupCollapsed(`${name} ${Object.values(table)}`);
    console.log(
        '%cName: ' + name,
        'color: rgb(199,192,112); font-weight: 900;',
    );
    console.log(
        '%cTimestamp: ' + performance.now(),
        'color: rgb(198,95,145);font-weight: 100;',
    );
    console.table([table], Object.keys(table));
    console.log('StackTop:', HoxCtxStack[0]);
    console.log('StackTail:', HoxCtxStack[HoxCtxStack.length - 1]);
    console.log('Stack:');
    console.table(HoxCtxStack);
    console.groupEnd();
};

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

export const HoxCtxStack = [] as HoxCtx[];

export const SetHoxCtxStackVal = (key: string, value: any) => {
    const ctx = currentHoxCtx();
    if (ctx) {
        ctx[key] = value;
    }
};

export const currentHoxCtx = (): HoxCtx | null =>
    (HoxCtxStack.length && HoxCtxStack[HoxCtxStack.length - 1]) || null;
export const currentHoxRef = (): HoxRef<unknown> | null => {
    const ctx = currentHoxCtx();
    if (ctx && ctx[HoxMapSymbol].has(ctx[HoxMapIdxSymbol])) {
        __HOX__DEBUGGER__ && debugLog('hit hox', ctx);
        return ctx[HoxMapSymbol].get(ctx[HoxMapIdxSymbol]);
    }
    return null;
};
export const setCurrentHoxRef = (ref: HoxRef<unknown>) => {
    const ctx = currentHoxCtx();
    if (ctx) {
        ctx[HoxMapSymbol].set(ctx[HoxMapIdxSymbol], ref);
        ctx[HoxMapIdxSymbol]++;
        __HOX__DEBUGGER__ && debugLog('setCurrentHoxRef', ctx);
    }
};
export const pushHoxCtx = (ctx: HoxCtx) => {
    HoxCtxStack.push(ctx);
    ctx[HoxMapIdxSymbol] = 0; // reset Index to 0
    __HOX__DEBUGGER__ && debugLog('pushHoxCtx', ctx);
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
        __HOX__DEBUGGER__ && debugLog('callUnmountCallback', ctx);
    }
};

export const onUnmount = (fn: () => void) => {
    const ctx = currentHoxCtx();
    if (ctx) {
        ctx[UnmountCallbackSymbol].push(fn);
        __HOX__DEBUGGER__ && debugLog('onUnmount', ctx);
    }
    return ctx;
};
