export const useClickOutside = (handler: (ev: MouseEvent) => void) => {
    let element: HTMLElement = null;
    document.addEventListener('click', event => {
        if (!element) {
            return;
        }
        if (!element.contains(event.target as Node)) {
            handler(event);
        }
    });
    return {
        ref(elem) {
            element = elem;
        },
    };
};
