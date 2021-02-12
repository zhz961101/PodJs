import { Ref, useRef, useWatch, isRef } from '@tacopie/taco';

const keyMap = {} as Record<string, boolean>;

export const useKeyPress = (
    keys: string | string[],
    handler?: (ev: KeyboardEvent) => void,
    domRef?: Ref<EventTarget>,
) => {
    const onKeyMapChange = (ev: KeyboardEvent) => {
        const keyArr = Array.isArray(keys) ? keys : [keys];
        for (const k of keyArr) {
            const names = k
                .split('.')
                .map(x => x.trim())
                .filter(Boolean);
            if (names.length === 0) {
                continue;
            }
            if (
                names.reduce(
                    (acc, cur) => acc && keyMap[cur.toLowerCase()],
                    true,
                )
            ) {
                handler(ev);
                return;
            }
        }
    };

    useWatch(
        () => domRef?.value,
        dom => {
            if (isRef(domRef) && !dom) {
                return;
            }
            const downHandler = (ev: KeyboardEvent) => {
                const { key } = ev;
                keyMap[key.toLowerCase()] = true;

                onKeyMapChange(ev);
            };
            const upHandler = (ev: KeyboardEvent) => {
                const { key } = ev;
                keyMap[key.toLowerCase()] = false;
            };
            (dom || window).addEventListener('keydown', downHandler);
            (dom || window).addEventListener('keyup', upHandler);
            return () => {
                (dom || window).removeEventListener('keydown', downHandler);
                (dom || window).removeEventListener('keyup', upHandler);
            };
        },
    );
};
