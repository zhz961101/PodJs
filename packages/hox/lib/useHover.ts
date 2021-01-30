import { useRef } from '@tacopie/taco';
import { useEventListener } from './useEventListener';

export const useHover = <T extends Element>() => {
    const isHovered = useRef(false);
    const hoverRef = useRef(null as null | T);
    useEventListener('mouseover', () => (isHovered.value = true), hoverRef);
    useEventListener('mouseout', () => (isHovered.value = false), hoverRef);
    return [hoverRef, isHovered];
};
