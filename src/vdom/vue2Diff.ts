import { isDef, likeHash } from "../utils";
import { Container } from "./container";
import { mount, mountPostion, patch, Vnode, vnodeType } from "./vdom";

export function patchMulitChildren(prevChildren: Vnode[], nextChildren: Vnode[], container: Container) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = prevChildren.length - 1;
    let oldStartVnode = prevChildren[0];
    let oldEndVnode = prevChildren[oldEndIdx];
    let newEndIdx = nextChildren.length - 1;
    let newStartVnode = nextChildren[0];
    let newEndVnode = nextChildren[newEndIdx];

    const patchedVnodes = new WeakSet();
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        // if (isUndef(oldStartVnode)) {
        //     oldStartVnode = prevChildren[++oldStartIdx] // Vnode has been moved left
        // } else if (isUndef(oldEndVnode)) {
        //     oldEndVnode = prevChildren[--oldEndIdx]
        // } else
        if (patchedVnodes.has(oldStartVnode)) {
            oldStartVnode = prevChildren[++oldStartIdx];
        } else if (patchedVnodes.has(oldStartVnode)) {
            oldEndVnode = prevChildren[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode, container);
            newStartVnode.el = oldStartVnode.el;
            oldStartVnode = prevChildren[++oldStartIdx];
            newStartVnode = nextChildren[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode, container);
            newEndVnode.el = oldEndVnode.el;
            oldEndVnode = prevChildren[--oldEndIdx];
            newEndVnode = nextChildren[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
            // patch(oldStartVnode, newStartVnode, container)
            if (prevChildren[oldEndIdx].el.nextSibling) {
                container.insertBefore(oldStartVnode.el, prevChildren[oldEndIdx].el.nextSibling);
            } else {
                container.appendChild(oldStartVnode.el);
            }
            newEndVnode.el = oldStartVnode.el;
            oldStartVnode = prevChildren[++oldStartIdx];
            newEndVnode = nextChildren[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
            // patch(oldStartVnode, newStartVnode, container)
            container.insertBefore(oldEndVnode.el, oldStartVnode.el);
            newStartVnode.el = oldEndVnode.el;
            oldEndVnode = prevChildren[--oldEndIdx];
            newStartVnode = nextChildren[++newStartIdx];
        } else {
            let find = false;

            for (let j = oldStartIdx; j <= oldEndIdx; j++) {
                const prevVnode = prevChildren[j];
                if (isDef(prevVnode.key) && isDef(newStartVnode.key) && prevVnode.key === newStartVnode.key) {
                    find = true;
                    if (sameVnode(prevVnode, newStartVnode)) {
                        patch(prevVnode, newStartVnode, container);
                        container.insertBefore(prevVnode.el, oldStartVnode.el);
                    } else {
                        mount(newStartVnode, container, prevVnode.el, mountPostion.AFTER);
                    }
                    patchedVnodes.add(prevVnode);
                }
            }
            if (!find) {
                mount(newStartVnode, container, oldStartVnode.el, mountPostion.BEFORE);
            }
            newStartVnode = nextChildren[++newStartIdx];
        }
    }
    if (oldStartIdx > oldEndIdx) {
        if (nextChildren[newStartIdx - 1]) {
            nextChildren.slice(newStartIdx, newEndIdx + 1)
                .reverse()
                .map((vnode) => {
                    mount(vnode, container, nextChildren[newStartIdx - 1].el, mountPostion.AFTER);
                });
        } else {
            nextChildren.slice(newStartIdx, newEndIdx + 1)
                .map((vnode) => {
                    mount(vnode, container, null, mountPostion.BEFORE);
                });
        }
    } else if (newStartIdx > newEndIdx) {
        prevChildren.slice(oldStartIdx, oldEndIdx + 1).map((vnode) => {
            container.removeChild(vnode.el);
        });
    }
}

const isTextInputType = makeMap("text,number,password,search,email,tel,url");

function makeMap(
    str: string,
    expectsLowerCase?: boolean,
): (key: any) => boolean {
    const map = Object.create(null);
    const list: string[] = str.split(",");
    for (const item of list) {
        map[item] = true;
    }
    return expectsLowerCase
        ? (val) => map[val.toLowerCase()]
        : (val) => map[val];
}

function sameInputType(a: Vnode, b: Vnode): boolean {
    if (a.tag !== "input") { return true; }
    let i;
    const typeA = isDef(i = a.attrs) && (a.attrs.type || "");
    const typeB = isDef(i = b.attrs) && (b.attrs.type || "");
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB);
}

function sameComment(a: Vnode, b: Vnode): boolean {
    if (a.type === vnodeType.COMMENT) {
        return a.type === b.type && a.children === b.children;
    }
    return true;
}

function sameVnode(a: Vnode, b: Vnode) {
    return (
        // isDef(a.key) && isDef(b.key) ? a.key === b.key :
        //     a.hash === b.hash &&
        a.key === b.key &&
        a.tag === b.tag &&
        isDef(a.attrs) === isDef(b.attrs) &&
        sameInputType(a, b) &&
        sameComment(a, b)
    );
}
