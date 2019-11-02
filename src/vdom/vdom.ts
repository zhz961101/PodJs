import { patchMulitChildren as reactPMC } from './React15Diff';
import { patchMulitChildren as vuePMC } from './vue2Diff';
import { Container, NodeContainer } from './container';
import { objectHash, isDef, isUnDef } from '../utils';

export interface Vattr {
    [key: string]: string | object
}

export interface Vnode {
    type: vnodeType
    tag?: string | Function
    attrs?: Vattr
    children: Vnode[] | Vnode | string
    childrenType: childType
    el?: Node
    key?: any
    // hash: number
}

export enum vnodeType {
    HTML,
    TEXT,

    COMPONENT,
}
export enum childType {
    EMPTY,
    SINGLE,
    MULITPLE,
}
export enum mountPostion {
    BEFORE,
    AFTER
}

const deepClone = (obj: any): any => {
    var proto = Object.getPrototypeOf(obj);
    return Object.assign({}, Object.create(proto), obj);
}

export const deepCloneVnode = (vnode: Vnode): Vnode => {
    let obj = deepClone(vnode)
    return {
        tag: obj.tag,
        children: obj.children,
        key: obj.key,
        attrs: obj.attrs,
        type: obj.type,
        childrenType: obj.childrenType,
        el: obj.el,
        // hash: obj.hash
    }
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
    let retVnode: Vnode = {
        type,
        tag,
        attrs,
        children: vchildren || children,
        childrenType,
        key: attrs && attrs.key,
        // hash: 0
    }
    // retVnode.hash = objectHash(retVnode)
    return retVnode
}

export function createTextVnode(content: string): Vnode {
    let retVnode: Vnode = {
        type: vnodeType.TEXT,
        tag: null,
        attrs: null,
        children: content,
        childrenType: childType.EMPTY,
        key: null,
        // hash: 0
    }
    // retVnode.hash = objectHash(retVnode)
    return retVnode
}
export function render(vnode: Vnode, container: Node) {
    if (container["vnode"]) {
        patch(container["vnode"], vnode, new NodeContainer(container))
    } else {
        // mount(vnode, container)
        const { childrenType, children } = vnode
        if (childrenType !== childType.EMPTY) {
            if (childrenType == childType.SINGLE) {
                mount(toVnode(children), new NodeContainer(container))
            } else if (childrenType == childType.MULITPLE) {
                for (const child of toVnodeArray(children)) {
                    mount(child, new NodeContainer(container), null, mountPostion.AFTER)
                }
            }
        }
    }
    vnode.el = container
    container["vnode"] = vnode
}

export function patch(prev: Vnode, next: Vnode, container: Container) {
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

function patchElement(prev: Vnode, next: Vnode, container: Container) {
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
            if (isDef(prevVal) && !nextAttrs.hasOwnProperty(key)) {
                patchAttr(el, key, prevVal, null)
            }
        }
    }

    patchChildren(
        prev.childrenType,
        next.childrenType,
        toVnodeArray(prev.children),
        toVnodeArray(next.children),
        new NodeContainer(el),
    )
}

export function patchChildren(
    prevChildrenType: childType,
    nextChildrenType: childType,
    prevChildren: Vnode[],
    nextChildren: Vnode[],
    container: Container,
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
                        mount(nextChildren[i], container, null, mountPostion.AFTER)
                    }
                    break
                }
            }
            break
        }
        case childType.EMPTY: {
            switch (nextChildrenType) {
                case childType.SINGLE: {
                    mount(nextChildren[0], container, null, mountPostion.AFTER)
                    break
                }
                case childType.EMPTY: {
                    break
                }
                case childType.MULITPLE: {
                    for (let i = 0; i < nextChildren.length; i++) {
                        mount(nextChildren[i], container, null, mountPostion.AFTER)
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
                    mount(nextChildren[0], container, null, mountPostion.AFTER)
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
                    // reactPMC(prevChildren, nextChildren, container)
                    break
                }
            }
            break
        }
    }
}

function replaceVnode(prev: Vnode, next: Vnode, container: Container) {
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

export function mount(vnode: Vnode, container: Container, flagNode: Node = null, postion: mountPostion = mountPostion.BEFORE) {
    let { type } = vnode
    if (type == vnodeType.HTML) {
        mountElement(vnode, container, flagNode, postion)
    } else if (type == vnodeType.TEXT) {
        mountText(vnode, container)
    } else if (type == vnodeType.COMPONENT) {
        // [TODO]
    }
}

function mountElement(vnode: Vnode, container: Container, flagNode: Node = null, postion: mountPostion = mountPostion.BEFORE) {
    if (vnode.el) {
        if (hasChildNode(container, vnode.el)) {
            return
        }
        setElementPostion(container, vnode.el, flagNode, postion)
        return
    }

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
            mount(toVnode(children), new NodeContainer(dom), null, mountPostion.AFTER)
        } else if (childrenType == childType.MULITPLE) {
            for (const child of toVnodeArray(children)) {
                mount(child, new NodeContainer(dom), null, mountPostion.AFTER)
            }
        }
    }
    setElementPostion(container, dom, flagNode, postion)
}

function setElementPostion(container: Container, el: Node, flagNode: Node, postion: mountPostion) {
    if (flagNode) {
        if (postion == mountPostion.AFTER) {
            container.insertAfter(el, flagNode)
        } else if (postion == mountPostion.BEFORE) {
            container.insertBefore(el, flagNode)
        }
        return
    }
    if (postion == mountPostion.AFTER) {
        container.appendChild(el)
    } else if (postion == mountPostion.BEFORE) {
        const childNodes = container.childNodes
        if (childNodes.length == 0) {
            container.appendChild(el)
        } else {
            container.insertBefore(el, childNodes[0])
        }
    }
}

function mountText(vnode: Vnode, container: Container) {
    if (vnode.el) {
        if (hasChildNode(container, vnode.el)) {
            return
        }
        container.appendChild(vnode.el)
        return
    }

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
                        if (isUnDef(next) || !next.hasOwnProperty(k))
                            el.style[k] = null
                }
            break
        }
        case 'class': {
            if (typeof next == "string")
                if (el instanceof HTMLElement)
                    el.className = next
            if (isUnDef(next))
                if (el instanceof HTMLElement)
                    el.className = ""
            break
        }
        default: {
            if (typeof next == "string")
                if (el instanceof HTMLElement)
                    el.setAttribute(key, next)
            if (isUnDef(next))
                if (el instanceof HTMLElement)
                    el.removeAttribute(key)
            break
        }
    }
}

function hasChildNode(container: Container, child: Node): boolean {
    for (const n of container.childNodes) {
        if (n === child) return true
    }
    return false
}
