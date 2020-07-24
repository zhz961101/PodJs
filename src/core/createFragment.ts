import { effect } from '@vue/reactivity';
import { uniqKey } from '../common';
import { TacoThrow } from '../fn/ErrorBoundary';
import { diffVNodeArray } from './diff';
import { NewHoxContext, popHoxCtx, pushHoxCtx } from './hox';
import { patch } from './patch';
import { VNode } from './types';

export function createFragment(render: () => VNode[], rootVnode: VNode) {
    const uk = uniqKey();
    const headAnchor = document.createComment(`👇${uk}👇`);
    const tailAnchor = document.createComment(`👆${uk}👆`);
    const fragElement = document.createDocumentFragment();
    fragElement.appendChild(headAnchor);
    fragElement.appendChild(tailAnchor);
    let lastNodes = [];
    let cacheNodes = [] as VNode[];

    // inject anchor
    rootVnode.real_dom_left = headAnchor;
    rootVnode.real_dom_right = tailAnchor;

    const bag = {
        get fragElement() {
            return fragElement;
        },
        get container() {
            return bag.getContainer();
        },
        getContainer: (): HTMLElement | null =>
            ((headAnchor.parentNode as unknown) as HTMLElement) ||
            ((tailAnchor.parentNode as unknown) as HTMLElement) ||
            null,
        mounted: () => !!bag.getContainer(),
        rerender: (nodes: VNode[]) => {
            if (!bag.container) {
                cacheNodes = nodes;
                console.warn('!!!');
                return;
            }
            // diffVNodeArray(lastNodes, nodes).forEach(patcher =>
            //     PatchQueue.push(() => patch(patcher, bag))
            // );
            diffVNodeArray(lastNodes, nodes).forEach(patcher =>
                patch(patcher, bag),
            );
            lastNodes = nodes;
        },
        mountToLeft: (elem: HTMLElement, anchor: VNode) => {
            const container = bag.container;
            if (!container) {
                console.warn('no container found', bag);
                return;
            }
            const anchorDom = anchor.real_dom_left || anchor.real_dom;
            return container.insertBefore(elem, anchorDom);
        },
        mountToRight: (elem: HTMLElement, anchor: VNode) => {
            const container = bag.container;
            if (!container) {
                console.warn('no container found', bag);
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
                console.warn('no container found', bag);
                return;
            }
            if (elem instanceof DocumentFragment) {
                // 如果是frag，那是上不了的，应该直接删除这个frag下的所有node
                if ((elem as any).fragInstance) {
                    (elem as any).fragInstance.drop();
                }
                return;
            }
            if (elem.parentNode) {
                elem.parentNode.removeChild(elem);
            } else {
                console.log('💢💢💢不是吧，阿sir，怎么会没有parentNode呢？');
            }
            // if (container.contains(elem)) {
            //     container.removeChild(elem);
            // }
        },
        mount: (elem: HTMLElement) => {
            const container = bag.container;
            if (!container) {
                console.warn('no container found', bag);
                return;
            }
            container.insertBefore(elem, tailAnchor);
        },
        drop: () => {
            while (headAnchor.nextSibling !== tailAnchor) {
                headAnchor.parentNode.removeChild(headAnchor.nextSibling);
            }
            headAnchor.parentNode.removeChild(headAnchor);
            tailAnchor.parentNode.removeChild(tailAnchor);
        },
    };

    (fragElement as any).fragInstance = bag;

    effect(() => {
        // 挂在hoxctx
        if (!rootVnode.hoxCtx) {
            rootVnode.hoxCtx = NewHoxContext();
        }
        pushHoxCtx(rootVnode.hoxCtx);
        //
        try {
            const nodes = render();
            bag.rerender(nodes);
        } catch (error) {
            TacoThrow(error);
        } finally {
            popHoxCtx();
        }
    });

    return bag;
}
