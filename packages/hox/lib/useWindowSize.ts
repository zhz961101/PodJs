import { reactive } from '@tacopie/taco';

export const useWindowSize = () => {
    const size = reactive({
        w: window.innerWidth,
        h: window.innerHeight,
    });
    window.addEventListener('resize', ({ target }) => {
        const { innerWidth, innerHeight } = target as any;
        if (innerWidth !== size.w) {
            size.w = innerWidth;
        }
        if (innerHeight !== size.h) {
            size.h = innerHeight;
        }
    });
    return size;
};
