import { effect, isRef, Ref } from '@vue/reactivity';
import { EmptyArray, EmptyObject } from '../common';
import { createFragment } from './createFragment';
import { VNode } from './types';
import { vnodeify } from './h';
import BooleanAttrbutes from './const/booleanAttrbutes';
import RenderReserved from './const/renderReserved';

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
            const fragObj = createFragment(
                () => arrify(type(props, children)).map(vnodeify),
                node,
            );

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
            const frag = document.createDocumentFragment();
            const fragObj = createFragment(
                () => arrify(content(EmptyObject, EmptyArray)).map(vnodeify),
                node,
            );

            fragObj.mountFrag(frag);
            dom = (frag as unknown) as HTMLElement;
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
    if (typeof style !== 'object' || style === null) {
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
        if (BooleanAttrbutes.includes(k as typeof BooleanAttrbutes[number])) {
            effect(() => { mountBooleanProps(elem, k, val); });
            continue;
        }
        if (RenderReserved.includes(k as typeof RenderReserved[number])) {
            // pass
            continue;
        }
        switch (k) {
            case 'style': {
                mountStyle(elem, val);
                break;
            }
            case 'ref': {
                if (Array.isArray(val)) {
                    val.forEach(v => mountRef(elem, v));
                } else {
                    mountRef(elem, val);
                }
                break;
            }
            case 'calssName':
            case 'class': {
                let prevClassName = '';
                effect(() => {
                    const current = getVal(val);
                    mountClassName(elem, current, prevClassName);
                    prevClassName = current;
                })
                break;
            };
            default: {
                effect(() => {
                    elem.setAttribute(key, getVal(val));
                });
                break;
            }
        }
    }
};

const clsArrify = (clsString: string) => clsString
    .trim()
    .split(' ')
    .map(s => s.trim())
    .filter(Boolean)

const mountClassName = (elem: HTMLElement, val: string, prev: string) => {
    if (typeof val !== "string") {
        return
    };
    const curCls = clsArrify(val);
    const preCls = clsArrify(prev);
    curCls.forEach(cls => elem.classList.add(cls));
    preCls.filter(c => !curCls.includes(c))
        .forEach(c => elem.classList.remove(c));
}

const mountRef = (elem: HTMLElement, ref: any | Ref<any>) => {
    if (typeof ref === 'function') {
        ref(elem);
    } else if (isRef(ref)) {
        ref.value = elem;
    }
}

const mountBooleanProps = (elem: HTMLElement, key: string, val: boolean) => {
    if (getVal(val) === true) {
        elem.setAttribute(key, '');
    } else {
        elem.removeAttribute(key);
    }
}
