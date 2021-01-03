/**
 * 不得不说这是一种非常复古的用法
 * OLD SCHOOL ~
 *
 * 但是确实方便，我也不太清楚为什么有人愿意自己实现一套
 * 而不是使用浏览器的接口
 */

interface CustomEventProps {
    data: any;
    timeStamp: number;
    type: string;
}

const Event2CustomEvent = (ev: Event): CustomEventProps => ({
    data: (ev as any).detail,
    timeStamp: ev.timeStamp,
    type: ev.type,
});

type CustomEventCallBack = (ev: CustomEventProps) => any;
type EventHandler = (ev: Event) => any;

const CallBackMap = new WeakMap<CustomEventCallBack, EventHandler>();

export const useCustomEvent = (
    type: string,
    priority: number,
    options: any = {},
    BASE_TRIGGER: EventTarget = document || window,
) => {
    return {
        Listen(fn: CustomEventCallBack) {
            const handler = (ev: Event) => {
                setTimeout(() => fn(Event2CustomEvent(ev)), priority);
                return null;
            };
            CallBackMap.set(fn, handler);
            BASE_TRIGGER.addEventListener(type, handler);
        },
        Dispatch(data: any = null) {
            const event = new CustomEvent(type, { ...options, detail: data });
            BASE_TRIGGER.dispatchEvent(event);
        },
        Remove(fn: CustomEventCallBack) {
            if (!CallBackMap.has(fn)) {
                return;
            }
            BASE_TRIGGER.removeEventListener(type, CallBackMap.get(fn));
        },
    };
};
