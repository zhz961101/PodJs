import { Component, VNode } from '../core/types';

const isSlot = (x: any) => x?.type === 'slot';
const notSlot = (x: any) => !isSlot(x);

type SlotableComponent = (
    props: object,
    children: VNode[],
    ...slots: VNode[]
) => VNode | null | VNode[];

export const Slotable = (fn: SlotableComponent): Component => {
    return function SlotableComponent(props, originChildren) {
        const slots = originChildren.filter(isSlot);
        const children = originChildren.filter(notSlot);
        return fn(props, children, ...slots);
    };
};
