import { useRef, useEffect, useWatch } from '@tacopie/taco';

export const useCustomEventVal = <Payload extends Record<string, any>>(
    eventName: string,
    defauleValue?: Payload,
) => {
    const value = useRef<Payload | null>(defauleValue || null);

    const dispatch = useCustomEvent<Payload>(
        eventName,
        payload => (value.value = payload),
    );
    useWatch(value, dispatch);

    return value;
};

export const useCustomEvent = <Payload extends Record<string, any>>(
    eventName: string,
    handler?: (payload: Payload) => void,
) => {
    useEffect(() => {
        if (!handler) {
            return;
        }
        const onEvent = ({ detail } = {} as any) => handler(detail as Payload);
        window.addEventListener(eventName, onEvent);
        return () => window.removeEventListener(eventName, onEvent);
    });
    return (payload: Payload) =>
        window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
};
