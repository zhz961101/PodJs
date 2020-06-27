import { effect } from "@vue/reactivity";
import { uniqKey } from "./common";
import { diffVNodeArray } from "./diff";
import { NewHoxContext, popHoxCtx, pushHoxCtx } from "./hox";
import { patch } from "./patch";
import { VNode } from "./types";

export function createFragment(render: () => VNode[], rootVnode: VNode) {
    const uk = uniqKey();
    const headAnchor = document.createComment(`👇${uk}👇`);
    const tailAnchor = document.createComment(`👆${uk}👆`);
    let lastNodes = [];
    let cacheNodes = [] as VNode[];

    // inject anchor
    rootVnode.real_dom_left = headAnchor;
    rootVnode.real_dom_right = tailAnchor;

    const bag = {
        get container() {
            return bag.getContainer();
        },
        getContainer: (): HTMLElement | null => headAnchor.parentNode as unknown as HTMLElement || tailAnchor.parentNode as unknown as HTMLElement || null,
        mounted: () => !!bag.getContainer(),
        mountFrag: (target: HTMLElement | DocumentFragment) => {
            target.appendChild(headAnchor);
            target.appendChild(tailAnchor);
            if (cacheNodes.length) {
                bag.rerender(cacheNodes);
                cacheNodes = [];
            }
        },
        rerender: (nodes: VNode[]) => {
            if (!bag.container) {
                cacheNodes = nodes;
                return;
            }
            diffVNodeArray(lastNodes, nodes).forEach((patcher) => patch(patcher, bag));
            lastNodes = nodes;
        },
        mountToLeft: (elem: HTMLElement, anchor: VNode) => {
            const container = bag.container;
            if (!container) {
                console.warn("no container found", bag);
                return;
            }
            const anchorDom = anchor.real_dom_left || anchor.real_dom;
            return container.insertBefore(elem, anchorDom);
        },
        mountToRight: (elem: HTMLElement, anchor: VNode) => {
            const container = bag.container;
            if (!container) {
                console.warn("no container found", bag);
                return;
            }
            const anchorDom = anchor.real_dom_right || anchor.real_dom;
            if (anchorDom.nextElementSibling) {
                container.insertBefore(elem, anchorDom.nextElementSibling);
            } else {
                container.insertBefore(elem, tailAnchor);
            }
        },
        unmount: (elem: HTMLElement) => {
            const container = bag.container;
            if (!container) {
                console.warn("no container found", bag);
                return;
            }
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            }
            // if (container.contains(elem)) {
            //     container.removeChild(elem);
            // }
        },
        mount: (elem: HTMLElement) => {
            const container = bag.container;
            if (!container) {
                console.warn("no container found", bag);
                return;
            }
            container.insertBefore(elem, tailAnchor);
        },
    };

    effect(() => {
        // 挂在hoxctx
        if (!rootVnode.hoxCtx) {
            rootVnode.hoxCtx = NewHoxContext();
        }
        pushHoxCtx(rootVnode.hoxCtx);
        //
        const nodes = render();
        bag.rerender(nodes);
        popHoxCtx();
    });

    (window as any).frags.push({
        bag,
        headAnchor,
        tailAnchor,
    });
    return bag;
}
