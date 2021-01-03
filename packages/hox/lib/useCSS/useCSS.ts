import jss from "jss";
import preset from "jss-preset-default";
import { uniqKey } from "../../common";
import { useState } from "../../core/useState";
import { CSSStyle } from "./types";

type StyleSheetType = ReturnType<typeof jss.createStyleSheet>;
const StyleSheetMap = new Map<string, StyleSheetType>();

const once = (fn) => (...args) => {
    fn(...args);
    fn = (x) => x;
};

const setup = once(() => {
    jss.setup(preset());
});

export const useCSS = (style: CSSStyle) => {
    //
    setup();
    //
    const [, , id] = useState(() => uniqKey());

    const sheet: StyleSheetType = (() => {
        if (StyleSheetMap.has(id.value)) {
            return StyleSheetMap.get(id.value);
        }
        const StyleSheet = jss.createStyleSheet({
            [id.value]: style,
        });
        StyleSheetMap.set(id.value, StyleSheet);
        return StyleSheet;
    })();

    if (!sheet.attached) {
        sheet.attach();
    }

    const className = sheet.classes[id.value];

    let target: HTMLElement = null;

    return {
        styleRef(elem: HTMLElement) {
            target = elem;
            elem.classList.add(className);
        },
        toggle() {
            if (!target) {
                return;
            }
            target.classList.toggle(className);
        },
        add() {
            if (!target) {
                return;
            }
            target.classList.add(className);
        },
        remove() {
            if (!target) {
                return;
            }
            target.classList.remove(className);
        },
    };
};
