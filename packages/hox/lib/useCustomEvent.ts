import { useRef, useEffect, useWatch } from '@tacopie/taco';

export const useCustomEventVal = <Value>(event: string) => {
    const value = useRef(null as Value);

    const onEvent = ({ detail } = {} as any) => (value.value = detail);

    useEffect(() => {
        window.addEventListener(event, onEvent);
        return () => window.removeEventListener(event, onEvent);
    });
    useWatch(value, newValue =>
        window.dispatchEvent(new CustomEvent(event, newValue)),
    );

    return value;
};
