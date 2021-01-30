import { Ref, useEffect, useRef } from '@tacopie/taco';

export const usePrevious = <T>(target: Ref<T>) => {
    const ref = useRef<T | undefined>(undefined);
    let previous: T;
    useEffect(() => {
        ref.value = previous;
        previous = target.value;
    });
    return ref;
};
