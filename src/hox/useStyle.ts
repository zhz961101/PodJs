import { UniqueId } from './common';

const str = x => (x && x.toString && x.toString()) || '';
const cssReg = /([^ :]+?) ?: ?([^;]+?)(;|$)/g;
export const css = (text: TemplateStringsArray, ...values: any[]) => {
    let cssText = '';
    for (const idx in text) {
        if (text.hasOwnProperty(idx)) {
            cssText += `${str(text[idx])}${str(values[idx])}`;
        }
    }
    const ret = {};
    for (const match of cssText.matchAll(cssReg)) {
        const [_, key, val] = match;
        ret[key] = val;
    }
    return ret;
};

export interface StyleOptions {
    [key: string]: string | number | StyleOptions;
}

const parseStyle = (style: StyleOptions, selector?: string): string => {
    const styles = [];
    let ret = '';
    for (const key in style) {
        if (style.hasOwnProperty(key)) {
            const val = style[key];
            if (typeof val === 'object') {
                const nxtSelector = key
                    .split(',')
                    .map(k => {
                        if (k.includes('&')) {
                            return k.replace('&', selector);
                        } else {
                            return `${selector} ${k}`;
                        }
                    })
                    .join(',');
                styles.push(parseStyle(val, nxtSelector));
            } else {
                if (key === 'content') {
                    ret += `${key}:'${val}';`;
                    continue;
                }
                ret += `${key}:${val};`;
            }
        }
    }
    return `${selector}{${ret}}${styles.join('')}`;
};

const styleClsMap: Map<string, string> = new Map<string, string>();

const styleToCls = (style: StyleOptions): [string, boolean] => {
    const text = JSON.stringify(style);
    if (styleClsMap.has(text)) {
        return [styleClsMap.get(text), true];
    }
    const cls = 'style_' + UniqueId();
    styleClsMap.set(text, cls);
    return [cls, false];
};

const emptyObject = o => Object.keys(o).length === 0;

export const useStyle = (style: StyleOptions = {}, applay: boolean = true) => {
    let className = '';
    let dupe = false;
    const EMPTY = emptyObject(style);
    if (!EMPTY) {
        [className, dupe] = styleToCls(style);
        if (!dupe) {
            const cssText = parseStyle(style, `.${className}`);
            const styleNode = document.createElement('style');
            styleNode.type = 'text/css';
            styleNode.innerHTML = cssText;
            document.head.appendChild(styleNode);
        }
    }

    let ref: HTMLElement = null;

    return {
        className,
        styleRef: (elem: HTMLElement) => {
            if (EMPTY) {
                return;
            }
            ref = elem;
            if (applay) {
                elem.classList.add(className);
            }
        },
        toggle() {
            if (!ref) {
                console.warn('ref is not set.', className);
                return;
            }
            ref.classList.toggle(className);
        },
        add() {
            if (!ref) {
                console.warn('ref is not set.', className);
                return;
            }
            ref.classList.add(className);
        },
        remove() {
            if (!ref) {
                console.warn('ref is not set.', className);
                return;
            }
            ref.classList.remove(className);
        },
    };
};
