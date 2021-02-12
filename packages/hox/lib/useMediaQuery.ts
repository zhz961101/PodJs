import { useMemo, useRef, useEffect, skip } from '@tacopie/taco';

export const useMediaQuery = <T>(
    queries: string[],
    values: T[],
    defaultValue: T,
) => {
    const mediaQueryLists = useMemo(() =>
        queries.map(q => window.matchMedia(q)),
    );

    const getValue = () => {
        const index = mediaQueryLists.value.findIndex(mql => mql.matches);
        return typeof values[index] !== 'undefined'
            ? values[index]
            : defaultValue;
    };

    const value = useRef(getValue);

    useEffect(() => {
        const handler = () => (value.value = getValue());
        skip(() => {
            mediaQueryLists.value.forEach(mql =>
                mql.addEventListener('change', handler),
            );
        });
        return () =>
            mediaQueryLists.value.forEach(mql =>
                mql.removeEventListener('change', handler),
            );
    });

    return value;
};
