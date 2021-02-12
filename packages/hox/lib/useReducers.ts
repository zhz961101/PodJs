import { useReducer, Ref } from '@tacopie/taco';

type ArgumentTailTypes<F> = F extends (first: any, ...args: infer A) => any
    ? A
    : never;

export const useReducers = <
    ReducerState,
    Action extends (state: ReducerState, ...args: any[]) => ReducerState,
    Reducers extends { [k: string]: Action },
    Keys extends keyof Reducers
>(
    reducers: Reducers,
    initialState: ReducerState,
) => {
    const [value, dispatch] = useReducer<
        ReducerState,
        { key: Keys; args: any[] }
    >((state, { key, args }) => reducers[key](state, ...args), initialState);
    const opt = {} as {
        [k in Keys]: (
            ...args: ArgumentTailTypes<typeof reducers[k]>
        ) => ReducerState;
    };
    Object.keys(reducers).forEach(k => {
        opt[k] = (...args: any[]) => dispatch({ key: k as Keys, args });
    });
    return [value, opt] as const;
};

const singleMap = new WeakMap();
export const useSingleReducers = <
    ReducerState,
    Action extends (state: ReducerState, ...args: any[]) => ReducerState,
    Reducers extends { [k: string]: Action },
    Keys extends keyof Reducers
>(
    reducers: Reducers,
    initialState: ReducerState,
) => {
    type Ret = readonly [Ref<ReducerState>, { [k in Keys]: () => void }];
    if (singleMap.has(reducers)) {
        return singleMap.get(reducers) as Ret;
    }
    const hokRet = useReducers(reducers, initialState);
    singleMap.set(reducers, hokRet);
    return hokRet as Ret;
};
