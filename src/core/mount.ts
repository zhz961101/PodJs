import { createElement } from './createElement';
import { VNode } from './types';

export function mount(target: HTMLElement, v: VNode | VNode[]) {
    if (!target || !(target instanceof HTMLElement)) {
        return;
    }
    const arr = Array.isArray(v) ? v : [v];
    for (const child of arr) {
        const dom = createElement(child);
        target.appendChild(dom);
    }
}
