import { useEffect } from './useEffect';
import { useState } from './useState';
import { delay } from './common';

export const useGenerator = (
    agFn: AsyncGeneratorFunction,
    ms: number = 1000,
) => {
    const [, , state] = useState();

    ms = Math.max(ms, 500);

    (async () => {
        let now = Date.now();
        for await (const val of agFn()) {
            state.value = val;
            const delayMs = Math.max(1, ms - (Date.now() - now));
            await delay(delayMs);
            now = Date.now();
        }
    })();

    return state;
};
