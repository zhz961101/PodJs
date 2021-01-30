import { useReducer, Ref } from '@tacopie/taco';

// TODO: action opt 支持多参数并且能正确类型推导

export const useReducers = <
    ReducerState,
    Reducers extends Record<Keys, (state: ReducerState) => ReducerState>,
    Keys extends keyof Reducers
>(
    reducers: Reducers,
    initialState: ReducerState,
) => {
    const [value, dispatch] = useReducer<ReducerState, Keys>(
        (state, action) => reducers[action](state),
        initialState,
    );
    const opt = {};
    Object.keys(reducers).forEach(k => {
        opt[k] = () => dispatch(k as Keys);
    });
    return [value, opt as { [k in Keys]: () => void }] as const;
};

const singleMap = new WeakMap();
export const useSingleReducers = <
    ReducerState,
    Reducers extends Record<Keys, (state: ReducerState) => ReducerState>,
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
