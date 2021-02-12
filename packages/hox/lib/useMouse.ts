import { throttle } from './common';
import { useEventListener } from './useEventListener';
import { Mptr, useRef } from '@tacopie/taco';

const { max, min } = Math;
export const useMouse = (fpsLimit = 30, dom?: Mptr<EventTarget>) => {
    fpsLimit = max(10, min(120, fpsLimit));
    const state = useRef({
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
    });
    useEventListener(
        'mousemove',
        throttle((e: MouseEvent) => {
            state.value = {
                screenX: e.screenX,
                screenY: e.screenY,
                clientX: e.clientX,
                clientY: e.clientY,
                pageX: e.pageX,
                pageY: e.pageY,
            };
        }, 1000 / fpsLimit),
        dom || window,
    );
    return state;
};
