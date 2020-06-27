import { reactive } from "@vue/reactivity";

type reducerFn = <T extends object>(state: T, actionType: string) => T;

const patchState = <T extends object>(newState: T, target: T): T => {
    Object.keys(newState).forEach(k =>
        target[k] === newState[k] ? (target[k] = newState[k]) : void 0,
    );
    return target;
};

interface DispatchOptions<T extends object> {
    state?: T;
    type?: string;
}

export const useReducer = <T extends object>(
    reducer: reducerFn,
    initialState: T = null,
): [() => T, (opt: DispatchOptions<T>) => T] => {
    const state = reactive<T>(initialState);
    const dispatch = (opt: DispatchOptions<T>) =>
        patchState(reducer<T>(opt.state, opt.type), state as T);
    return [() => ({ ...(state as T) }), dispatch];
};

export const useStore = <T extends object>(
    initialState: T = null,
): [() => T, (newState: T) => T] => {
    const [getter, dispatch] = useReducer(state => state, initialState);
    return [getter, newState => dispatch({ state: newState })];
};
