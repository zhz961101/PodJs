// web dev kit

const randStr = () => Math.random().toString(36).substr(2);

const isAnchor = Symbol('isAnchor');

export default {
    div: document.createElement('div'),
    frag: document.createDocumentFragment(),
    createText(content = '') {
        return document.createTextNode(content);
    },
    createDOM(type = 'div', is?: string) {
        return document.createElement(type, is ? { is } : undefined);
    },
    createFragment() {
        // TODO: 优化点 缓存fragdom，现在缓存会有bug，腰排查
        return document.createDocumentFragment();
    },
    createAnchor() {
        const anchor = document.createComment('');
        anchor[isAnchor] = true;
        (anchor as any)._id = randStr();
        return anchor;
    },
    removeSelf(self: Node) {
        const parent = self.parentNode;
        if (parent) {
            parent.removeChild(self);
        }
    },
    clearChildren(self: Node) {
        self.childNodes.forEach(self.removeChild.bind(self));
    },
    removeAllListener(dom: Node) {
        const tdom = dom as any;
        const types = Object.keys(tdom.listener || {});
        for (const type of types) {
            const listener = tdom.listener[type];
            listener && dom.removeEventListener(type, listener);
        }
    },
    removeListener(dom: Node, type: string, handler?: (ev: any) => void) {
        const tdom = dom as any;
        const listener = tdom.listener[type];
        listener && dom.removeEventListener(type, listener);
        handler && dom.removeEventListener(type, handler);
    },
    addListener(dom: Node, type: string, listener: (ev: any) => void) {
        const tdom = dom as any;
        tdom.listener = tdom.listener || {};

        tdom.listener[type] &&
            dom.removeEventListener(type, tdom.listener[type]);

        tdom.listener[type] = listener;
        dom.addEventListener(type, listener);
    },
};
