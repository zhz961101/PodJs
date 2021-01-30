import { useEffect, useCallback } from '@tacopie/taco';
import { Ref, unref } from '@vue/reactivity';

export const useEventListener = (
    eventName: string,
    handler: EventListener,
    _element = window as EventTarget | Ref<null | EventTarget>,
    options = {} as boolean | AddEventListenerOptions,
) => {
    const savedHandler = useCallback(handler);
    const { capture, passive, once } = {
        ...(typeof options === 'boolean' ? { capture: options } : options),
    } as AddEventListenerOptions;

    useEffect(() => {
        const element = unref(_element);
        const isSupported = element && element.addEventListener;
        if (!isSupported) {
            return;
        }

        const eventListener = event => savedHandler(event);
        const opts = { capture, passive, once };
        element.addEventListener(eventName, eventListener, opts);
        return () => {
            element.removeEventListener(eventName, eventListener, opts);
        };
    }, [eventName, _element, capture, passive, once]);
};
