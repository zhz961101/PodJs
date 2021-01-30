import { useReducer, Reducer, Ref } from '@tacopie/taco';

// 这个泛型真不会写...
const singleMap = new WeakMap();
export const useSingleReducer = <ReducerState, ReducerAction>(
    reducer: Reducer<ReducerState, ReducerAction>,
    initialState: ReducerState,
    initialAction?: ReducerAction,
): readonly [Ref<ReducerState>, (action: ReducerAction) => void] => {
    if (singleMap.has(reducer)) {
        return singleMap.get(reducer);
    }
    const hokRet = useReducer(reducer, initialState, initialAction);
    singleMap.set(reducer, hokRet);
    return hokRet;
};
