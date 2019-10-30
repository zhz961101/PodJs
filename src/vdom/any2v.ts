import { Vnode, Vattr, createElement, createTextVnode, vnodeType } from './vdom';

export function HTML2Vdom(html: string): Vnode {
    let root: any = document.createElement('div')
    root.innerHTML = html
    root = (root.childNodes.length === 1)
        ? root.childNodes[0]
        : root
    return toVirtualDOM(root)
}

export function Dom2Vnode(dom: any): Vnode {
    return toVirtualDOM(dom)
}

function toVirtualDOM(dom: any): Vnode {
    if (dom.nodeType === 3) {
        return createTextVnode(dom.nodeValue || node.textContent)
    }
    var tagName = dom.tagName.toLowerCase()
    var props = attrsToObj(dom)
    var children = []
    for (var i = 0, len = dom.childNodes.length; i < len; i++) {
        var node = dom.childNodes[i]
        // TEXT node
        if (node.nodeType === 3) {
            let content = node.nodeValue || node.textContent
            let childTextVnode = createTextVnode(content)
            childTextVnode.el = node
            children.push(childTextVnode)
        } else {
            children.push(toVirtualDOM(node))
        }
    }
    const vnode = createElement(tagName, props, children)
    vnode.el = dom
    return vnode
}


function attrsToObj(dom: any): Vattr {
    var attrs = dom.attributes
    var props = {}
    for (var i = 0, len = attrs.length; i < len; i++) {
        var name = attrs[i].name
        var value = attrs[i].value
        props[name] = value
    }
    if (dom.style.cssText) {
        props["style"] = cssText2obj(dom.style.cssText)
    }
    return props
}
const cssRe = /([-\w]+) *: *([\w\d(),+\-*/#.% ]+)(;|$)/g
function cssText2obj(cssText: string): object {
    let style = {}
    let match
    while (match = cssRe.exec(cssText)) {
        style[match[1]] = match[2]
    }
    return style
}
