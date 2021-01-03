export const useEventListener = <T extends EventTarget>(
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
) => {
    return (elem: T) => elem.addEventListener(type, handler, options);
};
