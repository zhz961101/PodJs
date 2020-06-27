import { reactive } from '@vue/reactivity';

export const useWindowSize = () => {
    const Size = reactive({
        w: window.innerWidth,
        h: window.innerHeight,
    });
    window.addEventListener('resize', ({ target }) => {
        const { innerWidth, innerHeight } = target as any;
        if (innerWidth !== Size.w) {
            Size.w = innerWidth;
        }
        if (innerHeight !== Size.h) {
            Size.h = innerHeight;
        }
    });
    return { Size };
};
