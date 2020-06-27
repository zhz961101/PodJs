import { throttle } from "./common";
import { useEffect } from "./useEffect";
import { useEventListener } from "./useEventListener";
import { useState } from "./useState";

export const useMouse = () => {
    const [getter, setter, state] = useState({
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
    });
    useEventListener(
        "mousemove",
        throttle((e: MouseEvent) => {
            state.value = {
                screenX: e.screenX,
                screenY: e.screenY,
                clientX: e.clientX,
                clientY: e.clientY,
                pageX: e.pageX,
                pageY: e.pageY,
            };
        }, 33.33),
    )(window);
    return state;
};
