import { useEffect } from './useEffect';
import { useState } from './useState';

export const useClickOutside = (handler: (ev: MouseEvent) => void) => {
    const [, , target] = useState<HTMLElement>();
    useEffect(() => {
        const evhandler = event => {
            if (!target.value) {
                return;
            }
            if (!target.value.contains(event.target as Node)) {
                handler(event);
            }
        };
        document.addEventListener('click', evhandler);
        return () => document.removeEventListener('click', evhandler);
    });
    return {
        ref(elem) {
            target.value = elem;
        },
    };
};
