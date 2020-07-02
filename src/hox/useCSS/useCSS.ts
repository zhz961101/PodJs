import jss from 'jss';
import preset from 'jss-preset-default';
import color from 'color';
import once from 'lodash/once';
import { CSSStyle } from './types';
import { uniqKey } from '../../common';
import { useState } from '../useState';

type StyleSheetType = ReturnType<typeof jss.createStyleSheet>;
const StyleSheetMap = new Map<string, StyleSheetType>();

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
        render() {
            if (!target) {
                return;
            }
            target.classList.remove(className);
        },
    };
};
