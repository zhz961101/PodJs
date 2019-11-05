// import { patchMulitChildren as reactPMC } from './react15Diff';
import { isDef, isUnDef } from "../utils";
import { Container, NodeContainer } from "./container";
import { patchMulitChildren as vuePMC } from "./vue2Diff";

declare global {
    interface Node {
        vnode?: Vnode;
    }
}

export interface Vattr {
    [key: string]: string | object;
}

export interface Vnode {
    type: vnodeType;
    tag?: string;
    attrs?: Vattr;
    children: Vnode[] | Vnode | string;
    childrenType: childType;
    el?: Node;
    key?: any;
    // hash: number
}

export enum vnodeType {
    HTML,
    TEXT,
    COMMENT,

    COMPONENT,
}
export enum childType {
    EMPTY,
    SINGLE,
    MULITPLE,
}
export enum mountPostion {
    BEFORE,
    AFTER,
}

const deepClone = (obj: any): any => {
    const proto = Object.getPrototypeOf(obj);
    return Object.assign({}, Object.create(proto), obj);
};

export const deepCloneVnode = (vnode: Vnode): Vnode => {
    const obj = deepClone(vnode);
    return {
        tag: obj.tag,
        children: obj.children,
        key: obj.key,
        attrs: obj.attrs,
        type: obj.type,
        childrenType: obj.childrenType,
        el: obj.el,
        // hash: obj.hash
    };
};

function toVnode(v: Vnode | Vnode[] | string): Vnode {
    if (Array.isArray(v)) { return toVnode(v[0]); }
    if (typeof v === "string") { return createTextVnode(v); }
    return v;
}

function toVnodeArray(v: Vnode | Vnode[] | string): Vnode[] {
    if (Array.isArray(v)) { return v; }
    if (typeof v === "string") { return [createTextVnode(v)]; }
    return [v];
}

// 新建vdom
// tag 属性 子元素
export function createElement(
    tag: string,
    attrs: Vattr,
    children: Vnode[] | string = null,
): Vnode {
    let type;
    if (typeof tag === "string") {
        if (tag === "#text") {
            type = vnodeType.TEXT;
        } else if (tag === "#comment") {
            type = vnodeType.COMMENT;
        } else {
            type = vnodeType.HTML;
        }
    } else {
        type = vnodeType.TEXT;
    }
    let childrenType;
    let vchildren;
    if (children === null) {
        childrenType = childType.EMPTY;
    } else if (Array.isArray(children)) {
        const length = children.length;
        if (length === 0) {
            childrenType = childType.EMPTY;
        } else if (length === 1) {
            childrenType = childType.SINGLE;
            if (typeof children[0] === "string") {
                vchildren = createTextVnode(children + "");
            }
        } else {
            childrenType = childType.MULITPLE;
        }
    } else {
        childrenType = childType.SINGLE;
        vchildren = createTextVnode(children + "");
    }
    const retVnode: Vnode = {
        tag,
        type,
        attrs,
        children: vchildren || children,
        childrenType,
        key: attrs && attrs.key,
        // hash: 0
    };
    // retVnode.hash = objectHash(retVnode)
    return retVnode;
}

export function createTextVnode(content: string): Vnode {
    const retVnode: Vnode = {
        tag: null,
        type: vnodeType.TEXT,
        attrs: null,
        children: content,
        childrenType: childType.EMPTY,
        key: null,
        // hash: 0
    };
    // retVnode.hash = objectHash(retVnode)
    return retVnode;
}

export function createCommentVnode(data: string): Vnode {
    return {
        tag: "#comment",
        type: vnodeType.COMMENT,
        children: data,
        childrenType: childType.SINGLE,
        key: null,
    };
}

export function render(vnode: Vnode, container: Node) {
    if (container.vnode) {
        patch(container.vnode, vnode, new NodeContainer(container));
    } else {
        // mount(vnode, container)
        const { childrenType, children } = vnode;
        if (childrenType !== childType.EMPTY) {
            if (childrenType === childType.SINGLE) {
                mount(toVnode(children), new NodeContainer(container));
            } else if (childrenType === childType.MULITPLE) {
                for (const child of toVnodeArray(children)) {
                    mount(child, new NodeContainer(container), null, mountPostion.AFTER);
                }
            }
        }
    }
    vnode.el = container;
    container.vnode = vnode;
}

export function patch(prev: Vnode, next: Vnode, container: Container) {
    const nextType = next.type;
    const prevType = prev.type;

    if (nextType !== prevType) {
        replaceVnode(prev, next, container);
        return;
    }
    // nextType === prevType
    switch (nextType) {
        case vnodeType.HTML: {
            replaceVnode(prev, next, container);
            break;
        }
        case vnodeType.TEXT: {
            patchText(prev, next);
            break;
        }
        case vnodeType.COMMENT: {
            patchComment(prev, next, container);
            break;
        }
        case vnodeType.COMPONENT: {
            // [TODO]
            break;
        }
        default: {
            // ERROR
            throw new Error("wrong patch call");
        }
    }
}

function patchComment(prev: Vnode, next: Vnode, container: Container) {
    next.el = prev.el;
}

function patchElement(prev: Vnode, next: Vnode, container: Container) {
    if (prev.type !== next.type) {
        replaceVnode(prev, next, container);
        return;
    }
    const el = (next.el = prev.el);
    const prevAttrs = prev.attrs;
    const nextAttrs = next.attrs;
    if (nextAttrs) {
        for (const key in nextAttrs) {
            if (nextAttrs.hasOwnProperty(key)) {
                const prevVal = prevAttrs[key];
                const nextVal = nextAttrs[key];
                patchAttr(el, key, prevVal, nextVal);
            }
        }
    }
    if (prevAttrs) {
        for (const key in prevAttrs) {
            if (prevAttrs.hasOwnProperty(key)) {
                const prevVal = prevAttrs[key];
                if (isDef(prevVal) && !nextAttrs.hasOwnProperty(key)) {
                    patchAttr(el, key, prevVal, null);
                }
            }
        }
    }

    patchChildren(
        prev.childrenType,
        next.childrenType,
        toVnodeArray(prev.children),
        toVnodeArray(next.children),
        new NodeContainer(el),
    );
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
                    patch(prevChildren[0], nextChildren[0], container);
                    break;
                }
                case childType.EMPTY: {
                    container.removeChild(prevChildren[0].el);
                    break;
                }
                case childType.MULITPLE: {
                    container.removeChild(prevChildren[0].el);
                    for (const child of nextChildren) {
                        mount(child, container, null, mountPostion.AFTER);
                    }
                    break;
                }
            }
            break;
        }
        case childType.EMPTY: {
            switch (nextChildrenType) {
                case childType.SINGLE: {
                    mount(nextChildren[0], container, null, mountPostion.AFTER);
                    break;
                }
                case childType.EMPTY: {
                    break;
                }
                case childType.MULITPLE: {
                    for (const child of nextChildren) {
                        mount(child, container, null, mountPostion.AFTER);
                    }
                    break;
                }
            }
            break;
        }
        case childType.MULITPLE: {
            switch (nextChildrenType) {
                case childType.SINGLE: {
                    for (const child of prevChildren) {
                        container.removeChild(child.el);
                    }
                    mount(nextChildren[0], container, null, mountPostion.AFTER);
                    break;
                }
                case childType.EMPTY: {
                    for (const child of prevChildren) {
                        container.removeChild(child.el);
                    }
                    break;
                }
                case childType.MULITPLE: {
                    vuePMC(prevChildren, nextChildren, container);
                    // reactPMC(prevChildren, nextChildren, container)
                    break;
                }
            }
            break;
        }
    }
}

function replaceVnode(prev: Vnode, next: Vnode, container: Container) {
    if (next.el) {
        container.replaceChild(next.el, prev.el);
    } else {
        mount(next, container, prev.el);
        container.removeChild(prev.el);
    }
}

function patchText(prev: Vnode, next: Vnode) {
    const el = (next.el = prev.el);
    if (next.children !== prev.children) {
        el.nodeValue = next.children + "";
    }
}

export function mount(
    vnode: Vnode,
    container: Container,
    flagNode: Node = null,
    postion: mountPostion = mountPostion.BEFORE,
) {
    const { type } = vnode;
    if (type === vnodeType.HTML) {
        mountElement(vnode, container, flagNode, postion);
    } else if (type === vnodeType.TEXT) {
        mountText(vnode, container);
    } else if (type === vnodeType.COMMENT) {
        // [TODO]
    } else if (type === vnodeType.COMPONENT) {
        // [TODO]
    }
}

function mountElement(
    vnode: Vnode,
    container: Container,
    flagNode: Node = null,
    postion: mountPostion = mountPostion.BEFORE,
) {
    if (vnode.el) {
        if (hasChildNode(container, vnode.el)) {
            return;
        }
        setElementPostion(container, vnode.el, flagNode, postion);
        return;
    }

    const dom = document.createElement(vnode.tag + "");
    vnode.el = dom;
    const { attrs, children, childrenType } = vnode;

    if (attrs) {
        for (const name in attrs) {
            if (attrs.hasOwnProperty(name)) {
                const attr = attrs[name];
                patchAttr(dom, name, null, attr);
            }
        }
    }

    if (childrenType !== childType.EMPTY) {
        if (childrenType === childType.SINGLE) {
            mount(toVnode(children), new NodeContainer(dom), null, mountPostion.AFTER);
        } else if (childrenType === childType.MULITPLE) {
            for (const child of toVnodeArray(children)) {
                mount(child, new NodeContainer(dom), null, mountPostion.AFTER);
            }
        }
    }
    setElementPostion(container, dom, flagNode, postion);
}

function setElementPostion(container: Container, el: Node, flagNode: Node, postion: mountPostion) {
    if (flagNode) {
        if (postion === mountPostion.AFTER) {
            container.insertAfter(el, flagNode);
        } else if (postion === mountPostion.BEFORE) {
            container.insertBefore(el, flagNode);
        }
        return;
    }
    if (postion === mountPostion.AFTER) {
        container.appendChild(el);
    } else if (postion === mountPostion.BEFORE) {
        const childNodes = container.childNodes;
        if (childNodes.length === 0) {
            container.appendChild(el);
        } else {
            container.insertBefore(el, childNodes[0]);
        }
    }
}

function mountText(vnode: Vnode, container: Container) {
    if (vnode.el) {
        if (hasChildNode(container, vnode.el)) {
            return;
        }
        container.appendChild(vnode.el);
        return;
    }

    const dom = document.createTextNode(vnode.children + "");
    vnode.el = dom;
    container.appendChild(dom);
}

function patchAttr(el: Node, key: string, prev: any, next: any) {
    if (prev === next) { return; }
    switch (key) {
        case "style": {
            if (typeof next === "object") {
                for (const k in next) {
                    if (el instanceof HTMLElement) {
                        el.style[k] = next[k];
                    }
                }
            }
            if (typeof prev === "object") {
                for (const k in prev) {
                    if (el instanceof HTMLElement) {
                        if (isUnDef(next) || !next.hasOwnProperty(k)) {
                            el.style[k] = null;
                        }
                    }
                }
            }
            break;
        }
        case "class": {
            if (typeof next === "string") {
                if (el instanceof HTMLElement) {
                    el.className = next;
                }
            }
            if (isUnDef(next) && isDef(prev)) {
                if (el instanceof HTMLElement) {
                    el.className = "";
                }
            }
            break;
        }
        default: {
            if (typeof next === "string") {
                if (el instanceof HTMLElement) {
                    el.setAttribute(key, next);
                }
            }
            if (isUnDef(next)) {
                if (el instanceof HTMLElement) {
                    el.removeAttribute(key);
                }
            }
            break;
        }
    }
}

function hasChildNode(container: Container, child: Node): boolean {
    for (const n of container.childNodes) {
        if (n === child) { return true; }
    }
    return false;
}
