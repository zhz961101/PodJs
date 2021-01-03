import { VNode, createVNode } from '@tacopie/taco';

export default (props: object, ...children: VNode[]): VNode =>
    createVNode('div', { ...props }, children);
