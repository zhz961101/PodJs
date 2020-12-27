import { effect, isRef, Ref } from '@vue/reactivity';
import {
    createComponentNode,
    createTextNode,
    isAsyncComponentSymbol,
    isAsyncGenerator,
    isComponent,
    isComponentSymbol,
    isText,
    isTextSymbol,
    isVNode,
    isVNodeSymbol,
    KVMap,
    MetaAsyncGeneratorComponent,
    MetaComponent,
    MetaProps,
    VComponentNode,
    ViewItem,
    VNode,
    VTextNode,
} from './types';
import WDK from './WDK';

// 👇 UTILS
const skip = (f: () => any) => Promise.resolve().then(f);

const freeO = (o: any) =>
    o && typeof o === 'object' && Object.keys(o).forEach(k => delete o[k]);

const destroyVNode = (v: VNode) => {
    v._dom && WDK.removeSelf(v._dom);
    v._dom && WDK.removeAllListener(v._dom);
    freeO(v);
};
// 👆 UTILS

export class Component {
    public static CurrentInstance = null as null | Component;
    public static HooksIdx = 0;

    public vnode: VComponentNode;
    public children = [] as Array<VNode | VNode[]>;
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
        source: Component,
    ) => void;

    constructor(vnode: VComponentNode) {
        this.vnode = vnode;
        this.vnode._component = this;
        this.anchor = WDK.createAnchor();
        this.createDOM();
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
    }
    public mountRef(props: any) {
        props.ref && mountRef(props.ref, this);
    }
    public createDOM() {
        effect(() => {
            const props = this.buildMetaProps();
            this.mountRef(props);

            const lastInstance = Component.CurrentInstance;
            this.parent = this.parent || lastInstance;
            Component.HooksIdx = 0;
            Component.CurrentInstance = this;

            let view: ReturnType<MetaComponent>;
            try {
                view = this.vnode.type(props);
            } catch (error) {
                this.throwError(error, this);
                view = [];
            }
            Component.HooksIdx = 0;

            skip(() => {
                const views = Array.isArray(view) ? view : [view];
                const vnodes = views.map(
                    this.normalizeView.bind(this),
                ) as VNode[];
                this.updateChildren(vnodes.flat(Infinity) as VNode[]);
                Component.CurrentInstance = lastInstance;
            });
        });
    }
    public mountChildren(children: VNode[]) {
        this.children = [...children];
        const parent = this.getParentElement();
        if (!parent) {
            return;
        }
        const { anchor } = this;
        const frag = this.createChildren();

        (this.children.flat(Infinity) as VNode[]).forEach(child =>
            mountProps(child.props || {}, child._dom),
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
    private destructor() {
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
        // 应该在这里diff
        const commitQueue = this.diffChildren(children);
        // PATH
        this.patchCommit(commitQueue);

        // this.vnode.children = children;
        this.children.length = children.length;
        children.forEach((child, idx) => {
            if (Array.isArray(this.children[idx])) {
                return;
            }
            this.children[idx] = child;
        });
    }
    private bindAsyncGenerator(
        gen: ReturnType<MetaAsyncGeneratorComponent>,
        idx: number,
    ) {
        subscribeAsyncGenerator(
            gen,
            product => {
                product = Array.isArray(product) ? product : [product];
                const children = product
                    .map(this.normalizeView.bind(this))
                    .flat(Infinity) as VNode[];
                this.updateChildrenIdx(children, idx);
            },
            this.throwError.bind(this),
        );
    }
    private bindRefViewItem(refItem: Ref<ViewItem | ViewItem[]>, idx: number) {
        effect(() => {
            const children = Array.isArray(refItem.value)
                ? refItem.value
                : [refItem.value];
            skip(() => {
                this.updateChildrenIdx(
                    children.map(this.normalizeBuiltinView),
                    idx,
                );
            });
        });
    }
    private normalizeBuiltinView(v: ViewItem) {
        if (isVNode(v)) {
            return v;
        }
        if (v === null || v === undefined) {
            return createTextNode('');
        }
        return createTextNode(String(v));
    }
    private normalizeView(v: ReturnType<MetaComponent>, idx: number) {
        if (isVNode(v)) {
            return v;
        }
        if (v === null || v === undefined) {
            return createTextNode('');
        }
        if (isAsyncGenerator(v)) {
            this.bindAsyncGenerator(v, idx);
            return createTextNode('');
        }
        if (isRef(v)) {
            this.bindRefViewItem(v as Ref<ViewItem | ViewItem[]>, idx);
            return createTextNode('');
        }
        return createTextNode(String(v));
    }
    private updateChildrenIdx(children: VNode[], idx: number) {
        const nextChildren = [
            ...this.children.slice(0, idx),
            children,
            ...this.children.slice(idx + 1),
        ];
        const flatten = nextChildren.flat(Infinity) as VNode[];
        const commitQueue = this.diffChildren(flatten);
        this.patchCommit(commitQueue);

        this.children = nextChildren;
        // this.vnode.children = flatten;
    }
    private diffChildren(nextChild: VNode[]) {
        const commitQueue = diff(
            [...((this.children || []).flat(Infinity) as VNode[])],
            nextChild,
            this,
        );
        return commitQueue;
    }
    private patchCommit(commitQueue: Commit[]) {
        const isUNMOUNT = (c: Commit) => c.kind === CommitKind.UNMOUNT;
        const isNotUNMOUNT = (c: Commit) => c.kind !== CommitKind.UNMOUNT;
        [
            ...commitQueue.filter(isNotUNMOUNT),
            ...commitQueue.filter(isUNMOUNT),
        ].forEach(this.doCommit.bind(this));
    }
    private doCommit(c: Commit) {
        const { kind, container, prev, next, nextChild } = c;
        if (next instanceof Component) {
            switch (kind) {
                case CommitKind.UNMOUNT:
                    next.destructor();
                case CommitKind.CLEAR:
                    return next.clearChildren();
                case CommitKind.MOUNTCOMPONENT:
                    return next.mountChildren(nextChild);
                case CommitKind.PATCH: {
                    console.warn('💣不应该出现在这里💣');
                    break;
                }
            }
            return;
        }
        if (isComponent(next) && isComponent(prev)) {
            if (!prev._component) {
                return;
            }
            switch (kind) {
                case CommitKind.CLEAR: {
                    prev._component.clearChildren();
                    break;
                }
                case CommitKind.MOUNT: {
                    next._component = next._component || new Component(next);
                    const parent = prev._component.getParentElement();
                    if (parent) {
                        parent.insertBefore(
                            next._component.anchor,
                            prev._component.anchor,
                        );
                    }
                    next._component.mounted();
                    break;
                }
                case CommitKind.UNMOUNT: {
                    prev._component.destructor();
                    break;
                }
                case CommitKind.PATCH: {
                    next._component = next._component || new Component(next);
                    const parent = prev._component.getParentElement();
                    if (parent) {
                        parent.insertBefore(
                            next._component.anchor,
                            prev._component.anchor,
                        );
                    }
                    prev._component.destructor();
                    next._component.mounted();
                    break;
                }
            }
            return;
        }
        if (!(next instanceof Component) && !(prev instanceof Component)) {
            switch (kind) {
                case CommitKind.CLEAR: {
                    WDK.clearChildren(next._dom);
                    break;
                }
                case CommitKind.MOUNT: {
                    const parent = prev._dom.parentNode;
                    parent.insertBefore(createElement(next), prev._dom);
                    break;
                }
                case CommitKind.UNMOUNT: {
                    const parent = prev._dom.parentNode;
                    parent.removeChild(prev._dom);
                    // freeO(prev);
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
        }
    }
}

const mountRef = <T>(refOrCallback: Ref<T> | ((x: T) => void), value: T) => {
    if (!refOrCallback) {
        return;
    }
    if (isRef(refOrCallback)) {
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

// TODO: 支持 Ref<T>
const mountProps = (props: KVMap, dom: Node) => {
    if (!(dom instanceof HTMLElement)) {
        return;
    }

    props.ref && mountRef(props.ref as any, dom);

    // value
    if ('value' in dom && props.value) {
        (dom as any).value = props.value;
    }

    // className
    const className = pluckPropsValue(props, 'className', true, '');
    if (className) {
        dom.className = className;
    }

    // inline style
    Object.keys(pluckPropsValue(props, 'style', true, {})).forEach(
        k => (dom.style[k] = props.style[k]),
    );

    // non eventlistener propsibutes
    Object.keys(props)
        .filter(
            k =>
                !reversedPropss.includes(k) &&
                !k.toLowerCase().startsWith('on'),
        )
        .forEach(k => {
            if (typeof props[k] === 'boolean') {
                if (props[k]) {
                    return dom.setAttribute(k, '');
                }
                return dom.removeAttribute(k);
            }
            dom.setAttribute(k, String(props[k]));
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
}

interface Commit {
    kind: CommitKind;
    container: VNode | Component;
    prev?: VNode | Component;
    next?: VNode | Component;
    nextChild?: VNode[];
}

const diff = (
    prevChild = [] as VNode[],
    nextChild = [] as VNode[],
    container: VNode | Component,
): Commit[] => {
    // 💣 切勿过度优化diff
    const c = (
        kind: CommitKind,
        next?: VNode | Component,
        prev?: VNode | Component,
        nextChild?: VNode[],
    ): Commit => ({ kind, container, prev, next, nextChild });

    const prevLength = prevChild.length;
    const nextLength = nextChild.length;
    if (prevLength !== nextLength) {
        return [
            c(CommitKind.CLEAR, container),
            c(CommitKind.MOUNTCOMPONENT, container, undefined, nextChild),
        ];
    }
    const queue = [] as Commit[];
    for (let idx = 0; idx < nextLength; idx++) {
        const nextNode = nextChild[idx];
        const prevNode = prevChild[idx];
        if (sameVnode(prevNode, nextNode)) {
            queue.push(c(CommitKind.PATCH, nextNode, prevNode));
            queue.push(...diff(prevNode.children, nextNode.children, nextNode));
            continue;
        }
        queue.push(c(CommitKind.UNMOUNT, nextNode, prevNode));
        queue.push(c(CommitKind.MOUNT, nextNode, prevNode));
    }

    return queue;
};

const sameVnode = (a: VNode, b: VNode) =>
    a.type === b.type &&
    a.props.key === b.props.key &&
    a.children.length === b.children.length;

const subscribeAsyncGenerator = async <T>(
    g: AsyncGenerator<T | never, T | never, T | unknown>,
    mapFn: (x: T, done: boolean) => void,
    onerror: (err: Error) => void,
) =>
    IdleWhileTrue(async () => {
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

const IdleWhileTrue = (f: () => Promise<boolean>) =>
    window.requestIdleCallback(async () => {
        const done = await f();
        if (done) {
            return;
        }
        IdleWhileTrue(f);
    });

// TODO: 支持SVG
// 把vnode解析成dom树
const createElement = (vnode: VNode): Node => {
    if (vnode._dom) {
        return vnode._dom;
    }
    // debugger;
    let dom: Node;
    if (isText(vnode)) {
        dom = WDK.createText(vnode.content);
    } else if (isComponent(vnode)) {
        const ins = new Component(vnode);
        dom = ins.getAnchor();
    } else {
        dom = WDK.createDOM(vnode.type as string, vnode.props.is as string);

        const frag = createChildren(vnode);
        dom.appendChild(frag);
        mountProps(vnode.props, dom);
    }
    vnode._dom = dom;

    return dom;
};

const createChildren = (vnode: VNode): DocumentFragment => {
    const frag = WDK.createFragment();
    vnode.children = vnode.children || [];
    for (const child of vnode.children) {
        const dom = createElement(child);
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

const TextComponent = (
    children: Array<ViewItem | Ref<ViewItem>>,
): VComponentNode => ({
    [isVNodeSymbol]: true,
    [isComponentSymbol]: true,
    type: (child => () => child)(children.map(maybeRef2Component)),
    children: [],
});

const shouldBeTextComponent = (
    type: string | MetaComponent,
    children: Array<ViewItem | Ref<ViewItem>>,
) =>
    typeof type === 'string' &&
    type === '#text' &&
    (children.length > 1 || children.filter(isRef).length !== 0);

const maybeTextNode = (v: ViewItem): VNode => {
    if (isVNode(v)) return v;
    return createTextNode(v as string);
};

const maybeMetaComponent = (v: any): VNode => {
    if (typeof v === 'function') return createComponentNode(v);
    return v;
};

// 💣 这个写得太丑了，TODO:重构
export const h = (
    type: string | MetaComponent,
    props = {} as KVMap,
    ...children: Array<ViewItem | Ref<ViewItem>>
): VNode | VTextNode | VComponentNode =>
    shouldBeTextComponent(type, children)
        ? TextComponent(children)
        : {
              [isVNodeSymbol]: true,
              [isTextSymbol]: type === '#text',
              [isComponentSymbol]: typeof type === 'function',
              [isAsyncComponentSymbol]:
                  type.constructor?.name === 'AsyncGeneratorFunction',
              type,
              props: props || {},
              children: (children || [])
                  .map(maybeRef2Component)
                  .map(maybeMetaComponent)
                  .map(maybeTextNode) as VNode[],
              _dom: null,
              content:
                  type === '#text'
                      ? String((children || [])[0] as string)
                      : null,
          };

// 把vnode 渲染导dom中
export const render = (
    vnodeOrComponent:
        | VNode
        | VNode[]
        | MetaComponent
        | MetaAsyncGeneratorComponent,
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

        mountProps(child.props || {}, child._dom);

        frag.appendChild(dom);
    }
    target.append(frag);
};

///////////////////////////////////////////
// 👇 testcase
///////////////////////////////////////////

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// const randInt = (max: number) => ~~(Math.random() * max);

// const dateTime = ref(Date.now());
// setInterval(() => (dateTime.value = Date.now()), 500);

// const App = () => {
//     let timer = 500;
//     const state = useRef('rolling' as 'start' | 'rolling');
//     const [chan, go] = useChannel();
//     return h('div', {}, [
//         h('#text', null, ['roll food 🌮!']),
//         h('br'),
//         h(async function* () {
//             while (true) {
//                 for (const food of '🍕/🍔/🍟/🌭/🌮/🌯/🥫/🍖/🍗/🥩/🍠/🍣/🍤'.split(
//                     '/',
//                 )) {
//                     await sleep(timer);
//                     timer = Math.min(500, timer + randInt(50) + 10);
//                     if (timer >= 500) {
//                         state.value = 'start';
//                         console.log('block');
//                         await chan.value;
//                     }
//                     yield [
//                         h('h1', null, [h('#text', null, [food])]),
//                         h('span', null, [h('#text', null, [`${Date.now()}`])]),
//                     ];
//                 }
//             }
//         }),
//         h(
//             'button',
//             {
//                 onclick() {
//                     if (state.value === 'start') {
//                         go();
//                         state.value = 'rolling';
//                         timer = 33.33;
//                     } else {
//                         go();
//                         timer = 33.33;
//                     }
//                 },
//             },
//             [h('#text', null, [state])],
//         ),
//     ]);
// };

// render(App, document.querySelector('#app'));

// function useDebouncedRef<T>(value: T, delay = 200) {
//     let timeout: number;
//     return customRef<T>((track, trigger) => {
//         return {
//             get() {
//                 track();
//                 return value;
//             },
//             set(newValue) {
//                 clearTimeout(timeout);
//                 timeout = setTimeout(() => {
//                     value = newValue;
//                     trigger();
//                 }, delay);
//             },
//         };
//     });
// }

// const Counter = () => {
//     const count = useRef(0);

//     const toastRef = useTeleport();

//     useWatch(
//         () => toastRef.value,
//         elem => {
//             if (elem instanceof HTMLElement) {
//                 elem.classList.add('message');
//             }
//         },
//     );

//     return [
//         h('#text', null, [count]),
//         h('br'),
//         h(
//             'button',
//             {
//                 onclick() {
//                     count.value++;
//                 },
//             },
//             [h('#text', null, ['+'])],
//         ),
//         h(
//             'button',
//             {
//                 onclick() {
//                     count.value--;
//                 },
//             },
//             [h('#text', null, ['-'])],
//         ),
//         h('div', { ref: toastRef }, [h('#text', null, ['awesome! ', count])]),
//         h(Teleport, null, [h('#text', null, ['this!'])]),
//     ];
// };
// render(Counter, document.querySelector('#app2'));

// const cssList = [
//     { background: '#fad0c4' },
//     { background: '#f99185' },
//     { background: '#fda085' },
//     { background: '#96e6a1' },
//     { background: '#ebedee' },
//     { background: '#330867' },
// ];

// const TheCircle = async function* () {
//     let idx = 0;
//     while (1) {
//         yield h('div', {
//             style: {
//                 transition: 'all 0.3s',
//                 transform: `translate3d(${randInt(300) - 300}px, ${
//                     randInt(300) - 300
//                 }px, 0)`,
//                 opacity: 0.5,
//                 'pointer-events': 'none',
//                 width: '400px',
//                 height: '400px',
//                 margin: '0 auto',
//                 borderRadius: '100%',
//                 ...cssList[idx],
//             },
//         });
//         idx = (idx + 1) % cssList.length;
//         await sleep(1000);
//     }
//     return null;
// };
// render(TheCircle, document.querySelector('#app3'));

// const Likes = (props: { info: { likes: string[] } }) => {
//     const like1 = props.info.likes[0];
//     return h('div', null, [h('span', null, [h('#text', null, [like1])])]);
// };

// const UserInfo = () => {
//     const info = 0.5 > Math.random() ? {} : { likes: ['music'] };
//     const rerender = ref(1);
//     [rerender.value];
//     useCatcher(console.warn);
//     return [
//         h('button', { onclick: () => (rerender.value = Math.random()) }, [
//             h('#text', null, ['roll']),
//         ]),
//         h('pre', null, [h('#text', null, [JSON.stringify(info, null, 2)])]),
//         h(Likes, { info }),
//     ];
// };
// render(UserInfo, document.querySelector('#app4'));
