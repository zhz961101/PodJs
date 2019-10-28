import { Vnode, patch, mount } from './vdom';

export function patchMulitChildren(prevChildren: Vnode[], nextChildren: Vnode[], container: Node) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = prevChildren.length - 1
    let oldStartVnode = prevChildren[0]
    let oldEndVnode = prevChildren[oldEndIdx]
    let newEndIdx = nextChildren.length - 1
    let newStartVnode = nextChildren[0]
    let newEndVnode = nextChildren[newEndIdx]


    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        // if (isUndef(oldStartVnode)) {
        //     oldStartVnode = prevChildren[++oldStartIdx] // Vnode has been moved left
        // } else if (isUndef(oldEndVnode)) {
        //     oldEndVnode = prevChildren[--oldEndIdx]
        // } else
        if (sameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode, container)
            newStartVnode.el = oldStartVnode.el
            oldStartVnode = prevChildren[++oldStartIdx]
            newStartVnode = nextChildren[++newStartIdx]
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patch(oldStartVnode, newStartVnode, container)
            oldEndVnode = prevChildren[--oldEndIdx]
            newEndVnode = nextChildren[--newEndIdx]
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
            // patch(oldStartVnode, newStartVnode, container)
            prevChildren[oldEndIdx].el.nextSibling ? container.insertBefore(oldStartVnode.el, prevChildren[oldEndIdx].el.nextSibling) : container.appendChild(oldStartVnode.el)
            newEndVnode.el = oldStartVnode.el
            oldStartVnode = prevChildren[++oldStartIdx]
            newEndVnode = nextChildren[--newEndIdx]
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
            // patch(oldStartVnode, newStartVnode, container)
            container.insertBefore(oldEndVnode.el, oldStartVnode.el)
            newStartVnode.el = oldEndVnode.el
            oldEndVnode = prevChildren[--oldEndIdx]
            newStartVnode = nextChildren[++newStartIdx]
        } else {
            let find = false

            for (let j = 0; j < prevChildren.length; j++) {
                const prevVnode = prevChildren[j];
                if (prevVnode.key === newStartVnode.key) {
                    find = true
                    if (sameVnode(prevVnode, newStartVnode)) {
                        patch(prevVnode, newStartVnode, container)
                        container.insertBefore(prevVnode.el, oldStartVnode.el)
                    } else {
                        mount(newStartVnode, container, oldStartVnode.el)
                    }
                }
            }
            if (!find) {
                mount(newStartVnode, container, oldStartVnode.el)
            }
            newStartVnode = nextChildren[++newStartIdx]
        }
    }
    if (oldStartIdx > oldEndIdx) {
        nextChildren.slice(newStartIdx, newEndIdx + 1).map(vnode => {
            mount(vnode, container)
        })
    } else if (newStartIdx > newEndIdx) {
        prevChildren.slice(oldStartIdx, oldEndIdx + 1).map(vnode => {
            container.removeChild(vnode.el)
        })
    }
}

const isTextInputType = makeMap('text,number,password,search,email,tel,url')

// function isUndef(v: any): boolean {
//     return v === undefined || v === null
// }

function isDef(v: any): boolean {
    return v !== undefined && v !== null
}

function makeMap(
    str: string,
    expectsLowerCase?: boolean
): (key: string) => true | void {
    const map = Object.create(null)
    const list: Array<string> = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}

function sameInputType(a: Vnode, b: Vnode) {
    if (a.tag !== 'input') return true
    let i
    const typeA = isDef(i = i.attrs) && i.type
    const typeB = isDef(i = i.attrs) && i.type
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function sameVnode(a: Vnode, b: Vnode) {
    return (
        a.key === b.key &&
        a.tag === b.tag &&
        isDef(a.attrs) === isDef(b.attrs) &&
        sameInputType(a, b)
    )
}

