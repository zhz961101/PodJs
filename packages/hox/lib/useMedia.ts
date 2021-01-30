import { useMemo, useState, useEffect, skip } from '@tacopie/taco';

export const useMedia = <T>(
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

    const [, setValue, value] = useState(getValue);

    useEffect(() => {
        const handler = () => setValue(getValue());
        skip(() => {
            mediaQueryLists.value.forEach(mql => mql.addListener(handler));
        });
        return () =>
            mediaQueryLists.value.forEach(mql => mql.removeListener(handler));
    });

    return value;
};
