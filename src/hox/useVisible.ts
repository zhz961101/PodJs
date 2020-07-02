import { nextTick } from '../common';
import { useState } from './useState';

export const useVisible = <T extends HTMLElement>() => {
    const [getter, setter, state] = useState(true);
    return {
        isVisibility: () => state.value,
        visibleRef(elem: T) {
            nextTick(() => {
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
            }, null);
        },
    };
};
