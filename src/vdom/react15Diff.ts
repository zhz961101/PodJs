import { Container } from "./container";
import { mount, patch, Vnode } from "./vdom";

export function patchMulitChildren(prevChildren: Vnode[], nextChildren: Vnode[], container: Container) {
    let lastIndex = 0;
    for (let i = 0; i < nextChildren.length; i++) {
        const nextVnode = nextChildren[i];
        let find = false;

        for (let j = 0; j < prevChildren.length; j++) {
            const prevVnode = prevChildren[j];
            if (prevVnode.key === nextVnode.key) {
                find = true;
                patch(prevVnode, nextVnode, container);
                if (j < lastIndex) {
                    const flagNode = nextChildren[i - 1].el.nextSibling;
                    container.insertBefore(prevVnode.el, flagNode);
                } else {
                    lastIndex = j;
                }
            }
        }
        if (!find) {
            const flagNode = i === 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling;
            mount(nextVnode, container, flagNode);
        }
    }
    for (const i in prevChildren) {
        if (prevChildren.hasOwnProperty(i)) {
            const prevVNode = prevChildren[i];
            const has = nextChildren.find((next) => next.key === prevVNode.key);
            if (!has) {
                container.removeChild(prevVNode.el);
            }
        }
    }
}
