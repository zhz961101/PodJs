import {
    Mptr,
    unref,
    useEffect,
    useMemo,
    useRef,
    useWatch,
} from '@tacopie/taco';
import * as CSS from 'csstype';

// emmmmmmmmmmmm?!? 这个循环引用居然没报错
type StyleProperties =
    | CSS.Properties
    | { [k: string]: string | number } // like: --hover-color: red;
    | { [k: string]: StyleProperties };

const kebabCase = (str: string) =>
    str.replace(/[A-Z]/g, item => '-' + item.toLowerCase());

const style2css = (style: StyleProperties, supperSelector: string) => {
    const styleArr = [[style, supperSelector]] as [object, string][];
    let styleText = '';
    while (styleArr.length !== 0) {
        const [curstyle, supSel] = styleArr.shift();
        styleText += `${supSel}{${
            Object.entries(curstyle)
                .map(([k, v]) => {
                    if (typeof v === 'object') {
                        const sel = k.split('&').join(supSel);
                        styleArr.push([v, sel]);
                        return '';
                    }
                    return `${kebabCase(k)}:${v}`;
                })
                .join(';') + ';'
        }}\n`;
    }
    return styleText;
};

const styleRegistry = new (class StyleRegistry {
    idx2Style = new Map<string, StyleProperties>();
    style2idx = new Map<string, string>();
    idxCount = new Map<string, number>();

    hash(sp: StyleProperties) {
        return encodeURIComponent(JSON.stringify(sp));
    }

    has(sp: StyleProperties) {
        return this.idx2Style.has(this.hash(sp));
    }

    register(sp: StyleProperties) {
        const hash = this.hash(sp);
        if (this.has(sp)) {
            const idx = this.style2idx.get(hash);
            this.idxCount.set(idx, (this.idxCount.get(idx) || 0) + 1);
            return this.style2idx.get(hash)!;
        }
        const idx = Math.random().toString(36).substr(2);
        this.idx2Style.set(idx, sp);
        this.style2idx.set(hash, idx);
        this.idxCount.set(idx, 1);
        return idx;
    }

    unregister(idx: string) {
        if (!this.idx2Style.has(idx)) {
            return;
        }
        this.idxCount.set(idx, (this.idxCount.get(idx) || 0) - 1);
        if (this.idxCount.get(idx) > 0) {
            return;
        }
        const sp = this.idx2Style.get(idx);
        const hash = this.hash(sp);
        this.style2idx.delete(hash);
        this.idx2Style.delete(idx);
        this.idxCount.delete(idx);
    }
})();

export const useStyle = (
    styleOrFactory: Mptr<StyleProperties> | (() => StyleProperties),
    selectorFn = (idx: string) => `[data-style-idx="${idx}"]`,
    bindStyleFn = (elem: HTMLElement, idx: string) =>
        elem.setAttribute('data-style-idx', idx),
) => {
    const styleIdx = useRef('');
    const styleContainer = useRef(() => document.createElement('style'));
    useWatch(
        () =>
            typeof styleOrFactory === 'function'
                ? styleOrFactory()
                : unref(styleOrFactory),
        (currentStyle: StyleProperties) => {
            const idx = styleRegistry.register(currentStyle);
            styleIdx.value = idx;

            const container =
                document.head || document.body || document.children[0];
            if (!container.contains(styleContainer.value)) {
                container.appendChild(styleContainer.value);
            }

            styleContainer.value.innerHTML = style2css(
                currentStyle,
                selectorFn(idx),
            );

            return () => styleRegistry.unregister(idx);
        },
    );

    return (elemRef: HTMLElement) => bindStyleFn(elemRef, unref(styleIdx));
};
