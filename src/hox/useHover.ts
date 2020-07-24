import { useState } from '../core/useState';
import { useEventListener } from './useEventListener';

export const useHover = <T extends HTMLElement>() => {
    const [getter, setter, state] = useState(false);
    const refOver = useEventListener('mouseover', () => (state.value = true));
    const refOut = useEventListener('mouseout', () => (state.value = false));
    return {
        isHovering: () => state.value,
        hoverRef(elem: T) {
            refOver(elem);
            refOut(elem);
        },
    };
};
