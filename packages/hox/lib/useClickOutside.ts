import { useEffect, useRef } from '@tacopie/taco';

export const useClickOutside = (handler: (ev: MouseEvent) => void) => {
    const target = useRef<HTMLElement>();
    const evhandler = event => {
        if (!target.value) {
            return;
        }
        if (!target.value.contains(event.target as Node)) {
            handler(event);
        }
    };
    useEffect(() => {
        document.addEventListener('click', evhandler);
        return () => document.removeEventListener('click', evhandler);
    });
    return target;
};
