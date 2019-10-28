// import { patchMulitChildren as reactPMC } from './React15Diff';
import { patchMulitChildren as vuePMC } from './vue2Diff';
import { ViewModel } from '../mvvm';

export interface Vattr {
    [key: string]: string | object
}

export interface Vnode {
    type: string
    tag?: string | Function
    attrs?: Vattr
    children: Vnode[] | Vnode | string
    childrenType: string
    el?: Node
    key?: any
}

export const vnodeType = {
    HTML: 'HTML',
    TEXT: 'TEXT',

    COMPONENT: 'COMPONENT'
}
export const childType = {
    EMPTY: 'EMPTY',
    SINGLE: 'SINGLE',
    MULITPLE: 'MULITPLE'
}


function toVnode(v: Vnode | Vnode[] | string): Vnode {
    if (Array.isArray(v)) return toVnode(v[0])
    if (typeof v == "string") return createTextVnode(v)
    return v
}

function toVnodeArray(v: Vnode | Vnode[] | string): Vnode[] {
    if (Array.isArray(v)) return v
    if (typeof v == "string") return [createTextVnode(v)]
    return [v]
}

// 新建vdom
// tag 属性 子元素
export function createElement(tag: string | Function, attrs: Vattr, children: Vnode[] | string = null): Vnode {
    let type
    if (typeof tag == 'string') {
        type = vnodeType.HTML
    } else if (typeof tag == 'function') {
        type = vnodeType.COMPONENT
    } else {
        type = vnodeType.TEXT
    }
    let childrenType
    let vchildren
    if (children == null) {
        childrenType = childType.EMPTY
    } else if (Array.isArray(children)) {
        let length = children.length
        if (length == 0) {
            childrenType = childType.EMPTY
        } else if (length == 1) {
            childrenType = childType.SINGLE
            if (typeof children[0] == "string")
                vchildren = createTextVnode(children + '')
        }
        else {
            childrenType = childType.MULITPLE
        }
    } else {
        childrenType = childType.SINGLE
        vchildren = createTextVnode(children + '')
    }
    return {
        type,
        tag,
        attrs,
        children: vchildren || children,
        childrenType,
        key: attrs && attrs.key,
    }
}

export function createTextVnode(content: string): Vnode {
    return {
        type: vnodeType.TEXT,
        tag: null,
        attrs: null,
        children: content,
        childrenType: childType.EMPTY,
        key: null,
    }
}
export function render(vnode: Vnode, container: Node) {
    if (container["vnode"]) {
        patch(container["vnode"], vnode, container)
    } else {
        mount(vnode, container)
    }
    container["vnode"] = vnode
}

export function patch(prev: Vnode, next: Vnode, container: Node) {
    let nextType = next.type
    let prevType = prev.type

    if (nextType !== prevType) {
        replaceVnode(prev, next, container)
    } else if (nextType == vnodeType.HTML) {
        patchElement(prev, next, container)
    } else if (nextType == vnodeType.TEXT) {
        patchText(prev, next)
    }
}

function patchElement(prev: Vnode, next: Vnode, container: Node) {
    if (prev.type !== next.type) {
        replaceVnode(prev, next, container)
        return
    }
    let el = (next.el = prev.el)
    let prevAttrs = prev.attrs
    let nextAttrs = next.attrs
    if (nextAttrs) {
        for (let key in nextAttrs) {
            let prevVal = prevAttrs[key]
            let nextVal = nextAttrs[key]
            patchAttr(el, key, prevVal, nextVal)
        }
    }
    if (prevAttrs) {
        for (let key in prevAttrs) {
            let prevVal = prevAttrs[key]
            if (prevVal && !nextAttrs.hasOwnProperty(key)) {
                patchAttr(el, key, prevVal, null)
            }
        }
    }

    patchChildren(
        prev.childrenType,
        next.childrenType,
        toVnodeArray(prev.children),
        toVnodeArray(next.children),
        el,
    )
}

function patchChildren(
    prevChildrenType: string,
    nextChildrenType: string,
    prevChildren: Vnode[],
    nextChildren: Vnode[],
    container: Node,
) {
    switch (prevChildrenType) {
        case childType.SINGLE: {
            switch (nextChildrenType) {
                case childType.SINGLE: {
                    patch(prevChildren[0], nextChildren[0], container)
                    break
                }
                case childType.EMPTY: {
                    container.removeChild(prevChildren[0].el)
                    break
                }
                case childType.MULITPLE: {
                    container.removeChild(prevChildren[0].el)
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
                }
            }
            break
        }
        case childType.EMPTY: {
            switch (nextChildrenType) {
                case childType.SINGLE: {
                    mount(nextChildren[0], container)
                    break
                }
                case childType.EMPTY: {
                    break
                }
                case childType.MULITPLE: {
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container)
                    }
                    break
                }
            }
            break
        }
        case childType.MULITPLE: {
            switch (nextChildrenType) {
                case childType.SINGLE: {
                    for (let i = 0; i < prevChildren.length; i++) {
                        container.removeChild(prevChildren[i].el)
                    }
                    mount(nextChildren[0], container)
                    break
                }
                case childType.EMPTY: {
                    for (let i = 0; i < prevChildren.length; i++) {
                        container.removeChild(prevChildren[i].el)
                    }
                    break
                }
                case childType.MULITPLE: {
                    vuePMC(prevChildren, nextChildren, container)
                    break
                }
            }
            break
        }
    }
}

function replaceVnode(prev: Vnode, next: Vnode, container: Node) {
    if (next.el)
        container.replaceChild(next.el, prev.el)
    else {
        mount(next, container, prev.el)
        container.removeChild(prev.el)
    }
}

function patchText(prev: Vnode, next: Vnode) {
    let el = (next.el = prev.el)
    if (next.children !== prev.children) {
        el.nodeValue = next.children + ''
    }
}

export function mount(vnode: Vnode, container: Node, flagNode: Node = null) {
    let { type } = vnode
    if (type == vnodeType.HTML) {
        mountElement(vnode, container, flagNode)
    } else if (type == vnodeType.TEXT) {
        mountText(vnode, container)
    } else if (type == vnodeType.COMPONENT) {
        // [TODO]
    }
}

function mountElement(vnode: Vnode, container: Node, flagNode: Node = null) {
    let dom = document.createElement(vnode.tag + '')
    vnode.el = dom
    let { attrs, children, childrenType } = vnode

    if (attrs) {
        for (const key in attrs) {
            patchAttr(dom, key, null, attrs[key])
        }
    }

    if (childrenType !== childType.EMPTY) {
        if (childrenType == childType.SINGLE) {
            mount(toVnode(children), dom)
        } else if (childrenType == childType.MULITPLE) {
            for (const child of toVnodeArray(children)) {
                mount(child, dom)
            }
        }
    }
    flagNode ? container.insertBefore(dom, flagNode) : container.appendChild(dom)
}

function mountText(vnode: Vnode, container: Node) {
    let dom = document.createTextNode(vnode.children + '')
    vnode.el = dom
    container.appendChild(dom)
}

function patchAttr(el: Node, key: string, prev: string | object | Function, next: string | object | Function) {
    if (prev == next) return
    switch (key) {
        case 'style': {
            if (typeof next == 'object')
                for (let k in next) {
                    if (el instanceof HTMLElement)
                        el.style[k] = next[k]
                }
            if (typeof prev == "object")
                for (let k in prev) {
                    if (el instanceof HTMLElement)
                        if (!next || !next.hasOwnProperty(k))
                            el.style[k] = null
                }
            break
        }
        case 'class': {
            if (typeof next == "string")
                if (el instanceof HTMLElement)
                    el.className = next
            break
        }
        default: {
            if (key[0] == "@") {
                if (prev && typeof prev == "function")
                    el.removeEventListener(key.slice(1), ev => prev(ev))
                if (next && typeof next == "function")
                    el.addEventListener(key.slice(1), ev => next(ev))
            } else {
                if (next && typeof next == "string")
                    if (el instanceof HTMLElement)
                        el.setAttribute(key, next)
            }
            break
        }
    }
}

