import { useEffect, usePtr } from '@tacopie/taco';

export const useLockSroll = () => {
    const target = usePtr(document.body);
    useEffect(() => {
        if (!(target.value instanceof Element)) {
            return;
        }
        const originalOverflow = getComputedStyle(target.value).overflow;
        target.value.style.overflow = 'hidden';
        return () => (target.value.style.overflow = originalOverflow);
    });
    return target;
};
