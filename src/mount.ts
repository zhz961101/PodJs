import { createElement } from "./createElement";
import { VNode } from "./types";

export function mount(target: HTMLElement, v: VNode) {
    if (!target || !(target instanceof HTMLElement)) {
        return;
    }
    const dom = createElement(v);
    target.appendChild(dom);
}