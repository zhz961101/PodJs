import { createElement } from "./createElement";
import { Patcher, PatcherType } from "./diff";
import { callUnmountCallback } from "./hox";
import { VNode } from "./types";

interface ContainerOpt {
    mountToLeft: (elem: HTMLElement, anchor: VNode) => void;
    mountToRight: (elem: HTMLElement, anchor: VNode) => void;
    unmount: (elem: HTMLElement) => void;
    mount: (elem: HTMLElement) => void;
}

export function patch(patcher: Patcher, opt: ContainerOpt) {
    const { type, prev, next, leftAnchor, rightAnchor } = patcher;
    switch (type) {
        case PatcherType.MOUNT: {
            const dom = createElement(next);
            next.real_dom = dom;
            if (leftAnchor?.real_dom) {
                return opt.mountToRight(dom, leftAnchor);
            }
            if (rightAnchor?.real_dom) {
                return opt.mountToLeft(dom, rightAnchor);
            }
            return opt.mount(dom);
        }
        case PatcherType.UNMOUNT: {
            if (!prev?.real_dom) {
                // ERROR
                console.warn("prev?.real_dom", prev?.real_dom);
                return;
            }
            callUnmountCallback();
            return opt.unmount(prev.real_dom);
        }
        case PatcherType.CONTENT_CHANGE: {
            if (!prev?.real_dom) {
                // ERROR
                console.warn("prev?.real_dom", prev?.real_dom);
                return;
            }
            prev.real_dom.textContent = prev.content = next.content;
            next.real_dom = prev.real_dom;
        }
    }
}
