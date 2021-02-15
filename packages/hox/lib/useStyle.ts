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
    selector = 'data-style-key';

    style2key = new Map<string, string>();
    key2Style = new Map<string, StyleProperties>();
    keyCount = new Map<string, number>();
    key2DOM = new Map<string, HTMLStyleElement>();

    hash(sp: StyleProperties) {
        return encodeURIComponent(JSON.stringify(sp));
    }

    mountStyle(sp: StyleProperties, key: string) {
        if (this.key2DOM.has(key)) {
            console.warn('Duplicate style definition!');
            return;
        }
        const styleElement = document.createElement('style');
        styleElement.innerHTML = style2css(sp, this.selector);
        const container =
            document.head || document.body || document.children[0];
        container.appendChild(styleElement);
        this.key2DOM.set(key, styleElement);
    }

    unmountStyle(key: string) {
        const container =
            document.head || document.body || document.children[0];
        const dom = this.key2DOM.get(key);
        if (!dom) {
            return;
        }
        this.key2DOM.delete(key);
        if (container.contains(dom)) {
            container.removeChild(dom);
        }
    }

    register(sp: StyleProperties) {
        const hash = this.hash(sp);
        if (this.style2key.has(hash)) {
            const key = this.style2key.get(hash);
            this.keyCount.set(key, (this.keyCount.get(key) || 0) + 1);
            return this.style2key.get(hash)!;
        }
        const key = Math.random().toString(36).substr(2);
        this.key2Style.set(key, sp);
        this.style2key.set(hash, key);
        this.keyCount.set(key, 1);
        this.mountStyle(sp, key);
        return key;
    }

    unregister(key: string) {
        if (!this.key2Style.has(key)) {
            return;
        }
        this.keyCount.set(key, (this.keyCount.get(key) || 0) - 1);
        if (this.keyCount.get(key) > 0) {
            return;
        }
        const sp = this.key2Style.get(key);
        const hash = this.hash(sp);
        this.style2key.delete(hash);
        this.key2Style.delete(key);
        this.keyCount.delete(key);
        this.unmountStyle(key);
    }
})();

export const useStyle = (
    styleOrFactory: Mptr<StyleProperties> | (() => StyleProperties),
) => {
    const styleIdx = useRef('');
    useWatch(
        () =>
            typeof styleOrFactory === 'function'
                ? styleOrFactory()
                : unref(styleOrFactory),
        (currentStyle: StyleProperties) => {
            const idx = styleRegistry.register(currentStyle);
            styleIdx.value = idx;
            return () => styleRegistry.unregister(idx);
        },
    );

    return (elemRef: HTMLElement) =>
        elemRef &&
        styleIdx.value &&
        elemRef.setAttribute(styleRegistry.selector, unref(styleIdx));
};
