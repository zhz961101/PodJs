import { useRef, Ref } from '@tacopie/taco';

const { min, max } = Math;
export const useClampNumber = (inital = 0, lo = 0, hi = 100) => {
    const value = useRef(inital);
    const setter = (nextValue: number) =>
        (value.value = min(hi, max(lo, nextValue)));
    return [
        {
            get value() {
                return value.value;
            },
            set value(nextValue) {
                setter(nextValue);
            },
        } as Ref<number>,
        setter,
    ] as const;
};
