import { Ref, useEffect, useReducer, useRef, useWatch } from '@tacopie/taco';

type EventKey =
    | keyof HTMLElementEventMap
    | keyof WindowEventMap
    | keyof DocumentEventMap;

type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

export const useEventTargetReducer = <
    ReducerState,
    Reducer extends (state: ReducerState, ev: Event) => ReducerState
>(
    domReducers: PartialRecord<EventKey, ReducerState | Reducer>,
    defaultValue: ReducerState,
    leftRef?: Ref<EventTarget>,
) => {
    const [state, dispatch] = useReducer<
        ReducerState,
        { key: EventKey; ev: Event }
    >((state, { key, ev }) => {
        if (typeof domReducers[key] === 'function') {
            return (domReducers[key] as Reducer)(state, ev);
        }
        return domReducers[key] as ReducerState;
    }, defaultValue);
    const rightRef = useRef<EventTarget | null>(null);

    useWatch(
        () => [leftRef?.value, rightRef.value] as const,
        ([ldom, rdom]) => {
            const keys = Object.keys(domReducers) as EventKey[];
            const callbacks = keys.map(
                key => [key, (ev: Event) => dispatch({ key, ev })] as const,
            );

            ldom && callbacks.map(([k, cb]) => ldom.addEventListener(k, cb));
            rdom && callbacks.map(([k, cb]) => rdom.addEventListener(k, cb));
            return () => {
                ldom &&
                    callbacks.map(([k, cb]) => ldom.removeEventListener(k, cb));
                rdom &&
                    callbacks.map(([k, cb]) => rdom.removeEventListener(k, cb));
            };
        },
    );

    return [state, rightRef];
};

export const useHover = (domRef?: Ref<EventTarget>) =>
    useEventTargetReducer(
        {
            mouseenter: true,
            mouseleave: false,
        },
        false,
        domRef,
    );
