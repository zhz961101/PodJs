import { useReducers } from './useReducers';

export const useCounter = (defaultCounter = 0) =>
    useReducers(
        {
            dec: (n: number) => n - 1,
            decrement: (n: number) => n - 1,
            inc: (n: number) => n + 1,
            increment: (n: number) => n + 1,
            reset: () => defaultCounter,
        },
        0,
    );
