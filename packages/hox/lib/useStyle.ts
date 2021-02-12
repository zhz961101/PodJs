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

export const useStyle = (
    styleOrFactory: Mptr<StyleProperties> | (() => StyleProperties),
    selector = (idx: string) => `.${idx}`,
) => {
    const styleIdx = useRef(() => Math.random().toString(36).substr(2));
    const styleSelector = useMemo(() => selector(styleIdx.value));

    const styleContainer = useRef(document.createElement('style'));
    useEffect(() => {
        (document.head || document.body || document.children[0]).appendChild(
            styleContainer.value,
        );
    });
    useWatch(
        () =>
            typeof styleOrFactory === 'function'
                ? styleOrFactory()
                : unref(styleOrFactory),
        (currentStyle: StyleProperties) =>
            (styleContainer.value.innerHTML = style2css(
                currentStyle,
                styleSelector.value,
            )),
    );
};
