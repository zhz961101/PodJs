import { skip, useRef } from '@tacopie/taco';

export const useVisible = <T extends HTMLElement>() => {
    const state = useRef(true);
    return [
        state,
        (elem: T) => {
            skip(() => {
                const intersectionObserver = new IntersectionObserver(
                    entries => {
                        if (entries[0].intersectionRatio <= 0) {
                            if (state.value) {
                                state.value = false;
                            }
                        } else {
                            if (!state.value) {
                                state.value = true;
                            }
                        }
                    },
                );
                intersectionObserver.observe(elem);
            });
        },
    ] as const;
};
