import { effect, isRef } from '@vue/reactivity';
import { EmptyArray, EmptyObject } from './common';
import { createFragment } from './createFragment';
import { VNode } from './types';

const arrify = <T>(t: T | T[]) => {
    if (Array.isArray(t)) {
        return t;
    }
    return [t];
};

export function createElement(node: VNode): HTMLElement {
    const { type, children, props, real_dom, content } = node;

    // 如果有某些框架 比如htm，会缓存vnode
    // 那么这里就很有可能带有各种上下文
    // if (real_dom) {
    //     return real_dom;
    // }
    let dom: HTMLElement;
    if (typeof type === 'function') {
        const ComponentRenderd = type(props, children);
        if (Array.isArray(ComponentRenderd) || ComponentRenderd === null) {
            const frag = document.createDocumentFragment();
            const fragObj = createFragment(() => arrify(type(props, children)), node);

            fragObj.mountFrag(frag);
            dom = (frag as unknown) as HTMLElement;
        } else {
            dom = createElement(ComponentRenderd);
        }
    } else if (type[0] === '[') {
        dom = (document.createTextNode('') as unknown) as HTMLElement;
        if (isRef(content)) {
            effect(() => {
                dom.textContent = content.value + '';
            });
        } else if (typeof content === 'function') {
            // 内联组件不挂在hoxctx
            const rendered = content();
            if (Array.isArray(rendered)) {
                const frag = document.createDocumentFragment();
                const fragObj = createFragment(
                    () => arrify(content(EmptyObject, EmptyArray)),
                    node,
                );

                fragObj.mountFrag(frag);
                dom = (frag as unknown) as HTMLElement;
            } else {
                effect(() => {
                    dom.textContent = content() + '';
                });
            }
        } else {
            dom.textContent = content + '';
        }
    } else {
        dom = document.createElement(type);
        mountProps(dom, props);
        children.forEach(vn => {
            dom.appendChild(createElement(vn));
        });
    }
    if (dom instanceof Node) {
        node.real_dom = dom;
    }
    return dom;
}

const mountStyle = (elem: HTMLElement, style: object) => {
    if (typeof style !== 'object') {
        return;
    }
    for (const [key, val] of Object.entries(style)) {
        effect(() => {
            elem.style[key] = getVal(val);
        });
    }
};

const getVal = v => (typeof v === 'function' ? v() : v);

const mountProps = (elem: HTMLElement, props: object) => {
    if (!props) {
        return;
    }
    for (const [key, val] of Object.entries(props)) {
        const k = key.toLowerCase();
        if (k.startsWith('on')) {
            if (typeof val !== 'function') {
                continue;
            }
            // event
            const name = k.substring(2);
            elem.addEventListener(name, val);
            continue;
        }
        switch (k) {
            case 'style': {
                mountStyle(elem, getVal(val));
                break;
            }
            case 'key': {
                // pass
                break;
            }
            case 'ref': {
                if (typeof val === 'function') {
                    val(elem);
                } else if (isRef(val)) {
                    val.value = elem;
                }
                break;
            }
            default: {
                effect(() => {
                    elem.setAttribute(key, getVal(val));
                });
                break;
            }
        }
    }
};
