import { useCallback, useMemo, useReducer } from '@tacopie/taco';

const initialState = {
    past: [],
    present: null,
    future: [],
};

interface StateType<T> {
    past: T[];
    present: null | T;
    future: T[];
}

interface Action<T> {
    type: ActionType;
    newPresent: T;
    initialPresent: T;
}

enum ActionType {
    UNDO = 'UNDO',
    REDO = 'REDO',
    SET = 'SET',
    CLEAR = 'CLEAR',
}

export const useUndo = <T>(initialPresent: T) => {
    const reducer = (state: StateType<T>, action: Partial<Action<T>>) => {
        const { past, present, future } = state;

        switch (action.type) {
            case ActionType.UNDO:
                const previous = past[past.length - 1];
                const newPast = past.slice(0, past.length - 1);

                return {
                    past: newPast,
                    present: previous,
                    future: [present, ...future],
                };
            case ActionType.REDO:
                const next = future[0];
                const newFuture = future.slice(1);

                return {
                    past: [...past, present],
                    present: next,
                    future: newFuture,
                };
            case ActionType.SET:
                const { newPresent } = action;

                if (newPresent === present) {
                    return state;
                }
                return {
                    past: [...past, present],
                    present: newPresent,
                    future: [] as T[],
                };
            case ActionType.CLEAR:
                const { initialPresent } = action;

                return {
                    present: initialPresent,
                    past: [] as T[],
                    future: [] as T[],
                };
        }
    };

    // 👆 REDUCER

    const [state, dispatch] = useReducer(reducer, {
        present: initialPresent,
        past: [],
        future: [],
    });

    const canUndo = useMemo(() => state.value.past.length !== 0);
    const canRedo = useMemo(() => state.value.future.length !== 0);

    const undo = useCallback(
        () => {
            if (canUndo) {
                dispatch({ type: ActionType.UNDO });
            }
        },
        () => [canUndo.value],
    );

    const redo = useCallback(
        () => {
            if (canRedo) {
                dispatch({ type: ActionType.REDO });
            }
        },
        () => [canRedo.value],
    );

    const set = useCallback((newPresent: T) =>
        dispatch({ type: ActionType.SET, newPresent }),
    );

    const clear = useCallback(() =>
        dispatch({ type: ActionType.CLEAR, initialPresent }),
    );

    return {
        state: useMemo(() => state.value.present),
        set,
        undo,
        redo,
        clear,
        canUndo,
        canRedo,
    };
};
