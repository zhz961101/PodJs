import { readonly, useRef } from '@tacopie/taco';

const debounce = <Args extends Array<any>, Ret>(
    func: (...args: Args) => Ret,
    wait: number,
    immediate = false,
) => {
    let timeout;
    return function (...args: Args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
};

export const useDebounce = <T>(inital: T, delayMS = 100, immediate = false) => {
    const debouncedValue = useRef(inital);

    return [
        () => debouncedValue.value,
        debounce(
            (nval: T) => (debouncedValue.value = nval),
            delayMS,
            immediate,
        ),
        readonly(debouncedValue),
    ] as const;
};
