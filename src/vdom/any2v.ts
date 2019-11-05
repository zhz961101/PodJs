import { childType, createCommentVnode, createElement, createTextVnode, Vattr, Vnode, vnodeType } from "./vdom";

export function HTML2Vdom(html: string): Vnode {
    let root: any = document.createElement("div");
    root.innerHTML = html;
    root = (root.childNodes.length === 1)
        ? root.childNodes[0]
        : root;
    return toVirtualDOM(root);
}

export function Dom2Vnode(dom: any): Vnode {
    return toVirtualDOM(dom);
}

function toVirtualDOM(dom: any): Vnode {
    if (dom.nodeType === 3) {
        const textvnode = createTextVnode(dom.nodeValue || dom.textContent);
        textvnode.el = dom;
        return textvnode;
    }
    if (dom.nodeType === 8) {
        const commentVnode = createCommentVnode(dom.nodeValue || dom.textContent);
        commentVnode.el = dom;
        return commentVnode;
    }
    const tagName = dom.tagName.toLowerCase();
    const props = attrsToObj(dom);
    const children: Vnode[] = [];
    for (let i = 0, len = dom.childNodes.length; i < len; i++) {
        const node = dom.childNodes[i];
        // TEXT node
        if (node.nodeType === 3) {
            const content = node.nodeValue || node.textContent;
            const childTextVnode = createTextVnode(content);
            childTextVnode.el = node;
            children.push(childTextVnode);
        } else {
            children.push(toVirtualDOM(node));
        }
    }
    const vnode = createElement(tagName, props, children.filter((v) => {
        if (v.type === vnodeType.TEXT) {
            if (typeof v.children === "string" && v.children === "\n") {
                // 删除无效节点
                return false;
            }
        }
        return true;
    }));
    vnode.el = dom;
    return vnode;
}

function attrsToObj(dom: any): Vattr {
    const attrs = dom.attributes;
    const props: any = {};
    for (let i = 0, len = attrs.length; i < len; i++) {
        const name = attrs[i].name;
        const value = attrs[i].value;
        props[name] = value;
    }
    if (dom.style.cssText) {
        props.style = cssText2obj(dom.style.cssText);
    }
    return props;
}
const cssRe = /([-\w]+) *: *([\w\d(),+\-*/#.% ]+)(;|$)/g;
function cssText2obj(cssText: string): object {
    const style = {};
    let match;
    while (true) {
        match = cssRe.exec(cssText);
        if (!match) {
            break;
        }
        style[match[1]] = match[2];
    }
    return style;
}
