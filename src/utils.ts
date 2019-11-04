
export const __DEV__ = false;
export const __IE__DEV__ = false;

export function exclude(obj: object, excludeKeys: string[]): object {
    excludeKeys = excludeKeys || [];
    excludeKeys.push("constructor", "__proto__");
    const ret = Object.create(null);
    for (const key in obj) {
        if (excludeKeys.indexOf(key) !== -1) { continue; }
        const value = obj[key];
        ret[key] = value;
    }
    const proto = Object.getPrototypeOf(obj);
    Object.getOwnPropertyNames(proto).forEach((key) => {
        if (excludeKeys.indexOf(key) !== -1) { return; }
        const value = obj[key];
        ret[key] = value;
    });
    return ret;
}
/* tslint:disable */
export function ctxCall(code: string): Function {
    return new Function("ctx", "with(ctx){return (" + code + ")}");
}
/* tslint:enable */
export function nodeToFragment(el: Node): DocumentFragment {
    const frag = document.createDocumentFragment();
    let child;
    while (true) {
        child = el.firstChild;
        if (!child) {
            break;
        }
        frag.appendChild(child);
        child.$lastParentNode = el;
    }
    return frag;
}

export function isElementNode(node: HTMLElement): boolean {
    return node.nodeType === 1;
}

export function isTextNode(node: HTMLElement): boolean {
    return node.nodeType === 3;
}

export function objectHash(obj: object): number {
    /* tslint:disable */
    const content = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const character = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
    /* tslint:enable */
}

export function likeHash(a: number, b: number, precision: number = 0.8): boolean {
    const as = a + "";
    const bs = b + "";
    let end = (a + "").length;
    end = Math.ceil(precision * end);
    return as.slice(0, end) === bs.slice(0, end);
}

export function isDef(obj: any): boolean {
    return obj !== undefined && obj !== null;
}

export function isUnDef(obj: any): boolean {
    return obj === undefined || obj === null;
}

const ua = navigator.userAgent;
const isIE = ua.indexOf("compatible") > -1 && ua.indexOf("MSIE") > -1;
export const isEdge = ua.indexOf("Edge") > -1 && !isIE;

export function randID(): number {
    return Math.ceil(Math.random() * Number.MAX_SAFE_INTEGER);
}

const protoToString = Object.prototype.toString;
export function isType(type: string): (o: any) => boolean {
    return (o: any): boolean => protoToString.call(o) === type;
}
