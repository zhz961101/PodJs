import { Mptr, unref, useRef, useWatch } from '@tacopie/taco';

export const useLockSroll = (domRef?: Mptr<HTMLElement>) => {
    const outputRef = useRef<HTMLElement | null>(null);
    useWatch(
        () => unref(outputRef) || unref(domRef) || document.body,
        target => {
            if (!(target instanceof Element)) {
                return;
            }
            const originalOverflow = getComputedStyle(target).overflow;
            target.style.overflow = 'hidden';
            return () => (target.style.overflow = originalOverflow);
        },
    );
    return outputRef;
};
