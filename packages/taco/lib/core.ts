import { effect, isRef, Ref, unref } from '@vue/reactivity';
import { Mptr } from './hook';
import {
    createComponentNode,
    createTextNode,
    isAsyncComponent,
    isAsyncComponentSymbol,
    isAsyncGenerator,
    isComponent,
    isComponentSymbol,
    isText,
    isTextSymbol,
    isVNode,
    isVNodeSymbol,
    KVMap,
    AsyncFunctionComponent,
    MetaComponent,
    MetaProps,
    VComponentNode,
    ViewItem,
    VNode,
    VTextNode,
} from './types';
import WDK from './WDK';

import { destroyVNode, isArr, arrify, isThenable, once, skip } from './utils';

export class Component<Props = any> {
    public static CurrentInstance = null as null | Component;
    public static HooksIdx = 0;

    public vnode: VComponentNode;
    public children = [] as Array<VNode>;
    // TODO: 现在没怎么用上这个锚点，之后可以再抽象一下
    public anchor: Comment;

    public parent = null as Component | null;

    public context = {
        mountCallbacks: [] as Array<() => void>,
        unmountCallbacks: [] as Array<() => void>,
    } as {
        mountCallbacks: Array<() => void>;
        unmountCallbacks: Array<() => void>;
    } & Record<string | number | symbol, any>;

    public errorCatcher: <Err extends Error>(
        err: Err,
        source: Component<Props>,
    ) => void;

    constructor(vnode: VComponentNode) {
        this.vnode = vnode;
        this.vnode._component = this;
        this.anchor = WDK.createAnchor();

        this.init();
    }
    public init() {
        if (isAsyncComponent(this.vnode)) {
            const [gen, popInstanceStack] = this.renderComponent() as [
                ReturnType<AsyncFunctionComponent<Props>>,
                () => any,
            ];
            this.bindAsyncGenerator(gen);
            popInstanceStack();
        } else {
            const [
                viewOrPartailFunction,
                popInstanceStack,
            ] = this.renderComponent();
            if (typeof viewOrPartailFunction !== 'function') {
                const views = arrify(viewOrPartailFunction);
                const vnodes = views.map(
                    this.normalizeView.bind(this),
                ) as VNode[];
                this.updateChildren(vnodes);
                popInstanceStack();
            } else {
                // 🍳 Partial Function Component

                const partailStartIdx = Component.HooksIdx;
                /**
                 * 这里带来了一个问题就是，hooks除了一些场景里面会触发gc，其他情况都没什么用
                 * 也许hook需要更加高级的数据结构来支持更相应式的场景？
                 * 😩~
                 */
                effect(() => {
                    Component.HooksIdx = partailStartIdx;
                    const view = viewOrPartailFunction();
                    // jump to outside of effect
                    skip(() => {
                        const views = arrify(view);
                        const vnodes = views.map(
                            this.normalizeView.bind(this),
                        ) as VNode[];
                        this.updateChildren(vnodes);
                        popInstanceStack();
                    });
                });
            }
        }
    }
    public mounted() {
        this.context.mountCallbacks.forEach(cb => cb.call(this, this));
    }
    public clearChildren() {
        this.vnode.children?.forEach(v => {
            v._dom && WDK.removeSelf(v._dom);
            // freeO(v);
        });
    }
    public getAnchor() {
        return this.anchor;
    }
    public getParentElement() {
        if (this.anchor.parentElement) {
            return this.anchor.parentElement;
        }
        // debugger;
    }
    public mountRef(props: any) {
        props.ref && mountRef(props.ref, this);
    }
    public renderComponent() {
        const props = {
            ...(this.vnode.type.defaultProps || {}),
            ...this.buildMetaProps(),
        };
        this.mountRef(props);

        const lastInstance = Component.CurrentInstance;
        this.parent = this.parent || lastInstance;
        Component.HooksIdx = 0;
        Component.CurrentInstance = this;

        let view: ReturnType<MetaComponent>;
        // TODO: support lazy component
        // 其实 component/lazy ，可以实现，但是也可以原生支持
        // 还是想让核心小一点，这块需要重构一下
        try {
            view = this.vnode.type(props);
        } catch (error) {
            this.throwError(error, this);
            view = [];
        }
        Component.HooksIdx = 0;

        return [
            view,
            once(() => (Component.CurrentInstance = lastInstance)),
        ] as const;
    }
    public mountChildren(children: VNode[]) {
        // this.vnode.children = children;
        this.children = children;
        const parent = this.getParentElement();
        if (!parent) {
            return;
        }
        const { anchor } = this;
        const frag = this.createChildren();

        (this.children.flat(Infinity) as VNode[]).forEach(child =>
            mountProps(child.props || {}, child._dom, false),
        );

        this.context.mountCallbacks.forEach(callback =>
            callback.call(this, this),
        );

        parent.insertBefore(frag, anchor);
    }
    public throwError<Err extends Error>(err: Err, source: Component) {
        if (this.errorCatcher) {
            return this.errorCatcher(err, source);
        } else if (this.parent) {
            return this.parent.throwError(err, source);
        }

        // nonblock throw
        skip(() => {
            throw err;
        });
    }
    public getContextValue<Value>(key: string | number | symbol): Value {
        return (
            this.context[key as string] ||
            (this.parent && this.parent.getContextValue(key)) ||
            null
        );
    }
    get displayName(): string {
        return (
            this.vnode.type.displayName || this.vnode.type.name || 'anonymous'
        );
    }
    public destructor() {
        this.vnode.children?.forEach(destroyVNode);
        delete this.vnode._component;
        WDK.removeSelf(this.anchor);
        this.context.unmountCallbacks.forEach(cb => cb.call(this, this));
        this.context.mountCallbacks = [];
        this.context.unmountCallbacks = [];
        this.errorCatcher = () => {};

        this.children.flat(Infinity).forEach(destroyVNode);
        this.children = [];
    }
    private createChildren(): DocumentFragment {
        const frag = WDK.createFragment();
        this.children = this.children || [];
        for (const child of this.children.flat(Infinity) as VNode[]) {
            const dom = createElement(child);
            frag.appendChild(dom);
        }
        return frag;
    }
    private buildMetaProps(): MetaProps {
        return {
            children: this.vnode.children,
            ...this.vnode.props,
        };
    }
    private updateChildren(children: VNode[]) {
        const commitQueue = this.diffChildren(children);
        this.children = children;

        // PATH
        CommitScheduler.do(commitQueue);
    }
    private bindAsyncGenerator(gen: ReturnType<AsyncFunctionComponent>) {
        subscribeAsyncGenerator(
            gen,
            product => {
                product = Array.isArray(product) ? product : [product];
                const children = product
                    .map(this.normalizeView.bind(this))
                    .flat(Infinity) as VNode[];
                this.updateChildren(children);
            },
            this.throwError.bind(this),
        );
    }
    private normalizeView(v: ReturnType<MetaComponent>) {
        if (isVNode(v)) {
            return v;
        }
        if (v === null || v === undefined) {
            return createTextNode('');
        }
        if (isRef(v)) {
            return createComponentNode(() => v.value);
        }
        if (isThenable(v)) {
            // TODO: 支持promise
            return createTextNode('');
        }
        return createTextNode(String(v));
    }
    private diffChildren(nextChild: Array<VNode>) {
        const commitQueue = diff([...this.children], nextChild, this);
        return commitQueue;
    }
    public mountTo(parent: Node, refChild?: Node) {
        if (refChild) {
            parent.insertBefore(this.getAnchor(), refChild);
        } else {
            parent.appendChild(this.getAnchor());
        }
        createElement(this.vnode);
        this.mounted();
    }
}

// ### time slice ###
// TODO:
// 可以优化
// 比如一个 TextNode 出现了多次文本 patch，可以合并，甚至中断patch
// 但是可能带来副作用，增加性能压力
const CommitScheduler = (() => {
    type CommitNode = Commit & { timestamp: number; nextNode?: CommitNode };

    let currentSyncCommitHead: CommitNode;

    const queueStack = [] as {
        asyncCommitHead: CommitNode;
        // 现在就是删除操作是要求同步的
        syncCommitHead: CommitNode;
    }[];

    const mapNode = (head: CommitNode, fn: (c: Commit) => void) => {
        let cur = head;
        while (cur) {
            fn(cur);
            cur = cur.nextNode;
        }
    };
    const clearSyncCommit = () => {
        mapNode(currentSyncCommitHead, doCommit);
        currentSyncCommitHead = undefined;
    };
    const trunCommit = (head?: CommitNode) => {
        if (!head) {
            clearSyncCommit();
            return tryTrunCommit();
        }
        const { nextNode: nextCommit } = head;
        requestIdleCallback(() => {
            doCommit(head);
            trunCommit(nextCommit);
        });
    };
    const tryTrunCommit = () => {
        if (currentSyncCommitHead === undefined && queueStack.length !== 0) {
            const { syncCommitHead, asyncCommitHead } = queueStack.shift();
            currentSyncCommitHead = syncCommitHead;
            trunCommit(asyncCommitHead);
            return;
        }
    };

    const commitArr2Lk = (queue: Commit[], timestamp: number): CommitNode => {
        if (queue.length === 0) return;
        const head = { ...queue[0], timestamp } as CommitNode;
        let cur = head;
        queue.slice(1).forEach(c => {
            cur.nextNode = { ...c, timestamp };
            cur = cur.nextNode;
        });
        return head;
    };

    const isUNMOUNT = (c: Commit) => c.kind === CommitKind.UNMOUNT;
    const isNotUNMOUNT = (c: Commit) => !isUNMOUNT(c);
    return {
        do(queue: Commit[]) {
            const timestamp = performance.now();

            const asyncCommitHead = commitArr2Lk(
                queue.filter(isNotUNMOUNT),
                timestamp,
            );
            const syncCommitHead = commitArr2Lk(
                queue.filter(isUNMOUNT),
                timestamp,
            );

            queueStack.push({ asyncCommitHead, syncCommitHead });

            tryTrunCommit();
        },
    };
})();

const doCommit = (c: Commit) => {
    const { kind, container, prev, next } = c;
    switch (kind) {
        case CommitKind.CLEAR: {
            if (isComponent(next)) {
                next._component.clearChildren();
            } else {
                WDK.clearChildren(next._dom);
            }
            break;
        }
        case CommitKind.MOUNT: {
            const parent = prev._dom.parentNode;
            if (isComponent(next)) {
                next._component = next._component || new Component(next);
                next._component.mountTo(parent, prev._dom);
            } else {
                parent.insertBefore(createElement(next), prev._dom);
            }
            break;
        }
        case CommitKind.UNMOUNT: {
            if (isComponent(prev)) {
                prev._component.destructor();
            } else {
                WDK.removeSelf(prev._dom);
            }
            // freeO(prev);
            break;
        }
        case CommitKind.APPEND: {
            if (container instanceof Component) {
                const parent = container.getParentElement();
                if (parent) {
                    parent.insertBefore(
                        createElement(next),
                        container.getAnchor(),
                    );
                }
            } else if (prev) {
                container._dom?.insertBefore(createElement(next), prev._dom);
            } else {
                container._dom?.appendChild(createElement(next));
            }
            break;
        }
        case CommitKind.PATCH: {
            next._dom = prev._dom;
            // freeO(prev);

            patchProps(prev, next);
            patchTextContent(prev, next);
            patchValue(prev, next);
            patchClass(prev, next);
            patchStyle(prev, next);
            break;
        }
    }
};

const mountRef = <T>(
    refOrCallback: Ref<T> | ((x: T) => void) | Array<Ref<T> | ((x: T) => void)>,
    value: T,
) => {
    if (Array.isArray(refOrCallback)) {
        return refOrCallback.forEach(rf => mountRef(rf, value));
    }
    if (!refOrCallback) {
        return;
    }
    if (isRef(refOrCallback) || 'value' in refOrCallback) {
        return (refOrCallback.value = value);
    }
    if (typeof refOrCallback !== 'function') {
        return;
    }
    return refOrCallback(value);
};

const patchTextContent = (prev: VNode, next: VNode) => {
    if (isText(prev) && isText(next)) {
        prev._dom.textContent = next.content;
        next._dom = prev._dom;
    }
};

const patchValue = (prev: VNode, next: VNode) => {
    if (!(prev._dom instanceof HTMLElement)) {
        return;
    }

    if ('value' in prev._dom && prev.props.value !== next.props.value) {
        (prev._dom as any).value = next.props.value;
    }
};

const pluckPropsValue = (
    props: KVMap,
    key: string,
    insensitive = false,
    fallback = '' as any,
) =>
    props[
        Object.keys(props || {}).filter(k =>
            insensitive ? k.toLowerCase() === key.toLowerCase() : k === key,
        )[0]
    ] || fallback;
const patchClass = (prev: VNode, next: VNode) => {
    if (!(prev._dom instanceof HTMLElement)) {
        return;
    }

    const prevClassName = pluckPropsValue(prev.props, 'className', true, '');
    const nextClassName = pluckPropsValue(next.props, 'className', true, '');
    if (prevClassName !== nextClassName) {
        prev._dom.className = String(nextClassName);
    }
};

const patchStyle = (prev: VNode, next: VNode) => {
    if (!(prev._dom instanceof HTMLElement)) {
        return;
    }

    const prevStyle = pluckPropsValue(prev.props, 'style', true, {});
    const nextStyle = pluckPropsValue(next.props, 'style', true, {});

    const prevStyleKeys = Object.keys(prevStyle);
    const nextStyleKeys = Object.keys(nextStyle);

    nextStyleKeys
        .filter(k => nextStyle[k] !== prevStyle[k])
        .forEach(k => ((prev._dom as HTMLElement).style[k] = nextStyle[k]));

    prevStyleKeys
        .filter(k => !nextStyleKeys.includes(k))
        .forEach(k => ((prev._dom as HTMLElement).style[k] = undefined));
};

const reversedPropss = [
    'key',
    'ref',
    'value',
    'class',
    'className',
    'style',
    'is',
    'children',
];

const patchProps = (prev: VNode, next: VNode | null) => {
    const pprops = prev.props;
    const nprops = next.props;
    const pks = Object.keys(pprops).filter(k => !reversedPropss.includes(k));
    const nks = Object.keys(nprops).filter(k => !reversedPropss.includes(k));
    if (pks.length === 0 && nks.length === 0) {
        return;
    }
    pks.filter(k => nks.includes(k)).forEach(k => {
        if (nprops[k] !== pprops[k] && prev._dom instanceof HTMLElement) {
            if (k.startsWith('on')) {
                if (typeof nprops[k] === 'function') {
                    WDK.addListener(prev._dom, k.substr(2), nprops[k] as any);
                }
                return;
            }
            if (typeof nprops[k] === 'boolean') {
                if (nprops[k]) {
                    return prev._dom.setAttribute(k, '');
                }
                return prev._dom.removeAttribute(k);
            }
            prev._dom.setAttribute(k, String(nprops[k]));
        }
    });
    pks.filter(k => !nks.includes(k)).forEach(k => {
        if (prev._dom instanceof HTMLElement) {
            if (k.startsWith('on')) {
                WDK.removeListener(prev._dom, k.substr(2), pprops[k] as any);
                return;
            }
            prev._dom.removeAttribute(k);
        }
    });
};

const mountProps = (
    props: KVMap<Mptr | (() => any)>,
    dom: Node,
    isSVG: boolean, // 好像不用特殊处理😅
) => {
    if (!(dom instanceof HTMLElement)) {
        return;
    }

    if (props.ref) {
        mountRef(props.ref as any, dom);
    }

    // value
    if ('value' in dom && props.value) {
        if (typeof props.value === 'function') {
            effect(() => ((dom as any).value = props.value()));
        } else {
            effect(() => ((dom as any).value = unref(props.value)));
        }
    }

    // className
    if (props.className) {
        if (typeof props.className === 'function') {
            effect(() => (dom.className = props.className() || ''));
        } else {
            effect(
                () =>
                    (dom.className = (unref(props.className) || '') as string),
            );
        }
    }

    // inline style
    if (props.style) {
        if (typeof props.style === 'object') {
            if (isRef(props.style)) {
                effect(() =>
                    Object.keys(unref(props.style)).forEach(
                        k => (dom.style[k] = props.style[k]),
                    ),
                );
            } else {
                Object.keys(props.style).forEach(k =>
                    effect(() => (dom.style[k] = unref(props.style[k]))),
                );
            }
        } else if (typeof props.style === 'function') {
            effect(() =>
                Object.keys(props.style()).forEach(
                    k => (dom.style[k] = props.style[k]),
                ),
            );
        }
    }

    // non eventlistener propsibutes
    Object.keys(props)
        .filter(
            k =>
                !reversedPropss.includes(k) &&
                !k.toLowerCase().startsWith('on'),
        )
        .forEach(k => {
            effect(() => {
                const val = (() => {
                    if (typeof props[k] === 'function') {
                        return props[k]();
                    }
                    return unref(props[k]);
                })();
                if (typeof val === 'boolean') {
                    if (val) {
                        return dom.setAttribute(k, '');
                    }
                    return dom.removeAttribute(k);
                }
                dom.setAttribute(k, String(val));
            });
        });

    // listener
    Object.keys(props)
        .filter(
            k =>
                !reversedPropss.includes(k) &&
                k.toLowerCase().startsWith('on') &&
                typeof props[k] === 'function',
        )
        .forEach(k => {
            WDK.addListener(dom, k.substr(2), props[k] as any);
        });
};

enum CommitKind {
    CLEAR,
    MOUNT,
    UNMOUNT,
    PATCH,
    MOUNTCOMPONENT,
    APPEND,
}

interface Commit {
    kind: CommitKind;
    container: VNode | Component;
    prev?: VNode;
    next?: VNode;
}

const diff = (
    prevChild = [] as Array<VNode>,
    nextChild = [] as Array<VNode>,
    container: VNode | Component,
): Commit[] => {
    // 💣 切勿过度优化diff 💣
    const c = (kind: CommitKind, next?: VNode, prev?: VNode): Commit => ({
        kind,
        container,
        prev,
        next,
    });

    const prevLength = prevChild.length;
    const nextLength = nextChild.length;
    const patchLength = Math.min(prevLength, nextLength);

    const queue = [] as Commit[];

    for (let idx = 0; idx < patchLength; idx++) {
        const nextNode = nextChild[idx];
        const prevNode = prevChild[idx];
        if (isArr(nextNode) && isArr(prevNode)) {
            const subQue = diff(nextNode, prevNode, container);
            queue.push(...subQue);
            continue;
        }
        if (sameVnode(prevNode, nextNode)) {
            queue.push(c(CommitKind.PATCH, nextNode, prevNode));
            queue.push(...diff(prevNode.children, nextNode.children, nextNode));
            continue;
        }
        queue.push(c(CommitKind.UNMOUNT, nextNode, prevNode));
        queue.push(c(CommitKind.MOUNT, nextNode, prevNode));
    }

    // rest children
    queue.push(
        ...(nextChild.slice(patchLength).flat(Infinity) as VNode[]).map(n =>
            c(CommitKind.APPEND, n),
        ),
    );
    queue.push(
        ...(prevChild.slice(patchLength).flat(Infinity) as VNode[]).map(n =>
            c(CommitKind.UNMOUNT, undefined, n),
        ),
    );

    return queue;
};

const sameVnode = (a: VNode, b: VNode) =>
    a.type.toString() === b.type.toString() &&
    a.props?.key === b.props?.key &&
    a.children?.length === b.children?.length;

const subscribeAsyncGenerator = async <T>(
    g: AsyncGenerator<T | never, T | never, T | unknown>,
    mapFn: (x: T, done: boolean) => void,
    onerror: (err: Error) => void,
) =>
    doneLoop(async () => {
        const { value, done } = await g.next().catch(err => {
            onerror(err);
            return { value: null, done: true };
        });
        mapFn(value, done);
        if (done) {
            return done;
        }
        return done;
    });

const doneLoop = (f: () => Promise<boolean>) =>
    window.requestAnimationFrame(async () => {
        const done = await f();
        if (done) {
            return;
        }
        doneLoop(f);
    });

// VNODE => DOM🌳
const createElement = (vnode: VNode, isSVG = false): Node => {
    if (vnode._dom) {
        return vnode._dom;
    }
    // debugger;
    let dom: Node;
    if (isText(vnode)) {
        dom = WDK.createText(vnode.content);
    } else if (isComponent(vnode)) {
        vnode._component = vnode._component || new Component(vnode);
        dom = vnode._component.getAnchor();
    } else {
        isSVG = isSVG || vnode.type === 'svg';

        dom = WDK.createDOM(
            vnode.type as string,
            vnode.props?.is as string,
            isSVG,
        );

        const frag = createChildren(vnode, isSVG);
        dom.appendChild(frag);
        mountProps(vnode.props, dom, isSVG);
    }
    vnode._dom = dom;

    return dom;
};

const createChildren = (vnode: VNode, isSVG = false): DocumentFragment => {
    isSVG = isSVG || vnode.type === 'svg';

    const frag = WDK.createFragment();
    vnode.children = vnode.children || [];
    for (const child of vnode.children) {
        const dom = createElement(child, isSVG);
        frag.appendChild(dom);
    }
    return frag;
};

type NotRef<T> = T extends Ref<any> ? never : T;
const maybeRef2Component = (v: ViewItem | Ref<ViewItem>): NotRef<ViewItem> => {
    if (!isRef(v)) {
        return v;
    }
    return createComponentNode(() => v.value);
};

const maybeTextNode = (v: ViewItem): VNode => {
    if (isVNode(v)) return v;
    return createTextNode(v as string);
};

const maybeMetaComponent = (v: any): VNode => {
    if (typeof v === 'function') return createComponentNode(v);
    return v;
};

export const h = <Props extends KVMap>(
    type: string | MetaComponent<Props>,
    props = {} as Props,
    ...children: Array<ViewItem | Ref<ViewItem>>
): VNode | VTextNode | VComponentNode => ({
    [isVNodeSymbol]: true,
    [isComponentSymbol]: typeof type === 'function',
    [isAsyncComponentSymbol]:
        type.constructor?.name === 'AsyncGeneratorFunction',
    type,
    props: props || {},
    children: (children || [])
        .flat(Infinity)
        .map(maybeRef2Component)
        .map(maybeMetaComponent)
        .map(maybeTextNode) as VNode[],
    _dom: null,
    // FIXME: 这里太丑了，应该让children支持其他类型，然后text从children拿content（但是类型有点不好写）
    content: type === '#text' ? String((children || [])[0] as string) : null,
});

// 把vnode渲染到dom中
export const render = (
    vnodeOrComponent: VNode | VNode[] | MetaComponent | AsyncFunctionComponent,
    target: HTMLElement,
) => {
    target.innerHTML = '';
    if (typeof vnodeOrComponent === 'function') {
        const component = new Component(createComponentNode(vnodeOrComponent));
        component.mounted();
        target.appendChild(component.getAnchor());
        return;
    }
    const vnode = Array.isArray(vnodeOrComponent)
        ? vnodeOrComponent
        : [vnodeOrComponent];

    const frag = WDK.createFragment();
    for (const child of vnode) {
        const dom = createElement(child);

        mountProps(child.props || {}, child._dom, false);

        frag.appendChild(dom);
    }
    target.append(frag);
};
