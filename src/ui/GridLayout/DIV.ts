import { VNode, createVNode } from '../../types';

export default (props: object, ...children: VNode[]): VNode =>
    createVNode('div', { ...props }, children);
