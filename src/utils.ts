
export function exclude(obj: object, exclude: string[]): object {
    exclude = exclude || [];
    exclude.push("constructor", "__proto__")
    let ret = Object.create(null);
    for (const key in obj) {
        if (exclude.indexOf(key) != -1) continue;
        const value = obj[key];
        ret[key] = value
    }
    let proto = Object.getPrototypeOf(obj);
    Object.getOwnPropertyNames(proto).forEach(key => {
        if (exclude.indexOf(key) != -1) return;
        const value = obj[key];
        ret[key] = value
    })
    return ret;
}

export function ctxCall(code: string): Function {
    return new Function("ctx", "with(ctx){return (" + code + ")}")
}

export function nodeToFragment(el: Node): DocumentFragment {
    const frag = document.createDocumentFragment()
    let child
    while (child = el.firstChild) {
        frag.appendChild(child)
    }
    return frag
}

export function isElementNode(node: HTMLElement): boolean {
    return node.nodeType == 1
}

export function isTextNode(node: HTMLElement): boolean {
    return node.nodeType == 3
}