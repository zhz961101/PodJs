import { Vnode, patch, mount } from './vdom';
import { Container } from './container';

export function patchMulitChildren(prevChildren: Vnode[], nextChildren: Vnode[], container: Container) {
    let lastIndex = 0
    for (let i = 0; i < nextChildren.length; i++) {
        const nextVnode = nextChildren[i];
        let find = false

        for (let j = 0; j < prevChildren.length; j++) {
            const prevVnode = prevChildren[j];
            if (prevVnode.key === nextVnode.key) {
                find = true
                patch(prevVnode, nextVnode, container)
                if (j < lastIndex) {
                    let flagNode = nextChildren[i - 1].el.nextSibling
                    container.insertBefore(prevVnode.el, flagNode)
                } else {
                    lastIndex = j
                }
            }
        }
        if (!find) {
            let flagNode = i == 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling
            mount(nextVnode, container, flagNode)
        }
    }
    for (let i = 0; i < prevChildren.length; i++) {
        const prevVNode = prevChildren[i];
        const has = nextChildren.find(next => next.key == prevVNode.key)
        if (!has) {
            container.removeChild(prevVNode.el)
        }
    }
}