import { isRef } from '@vue/reactivity';
import { EmptyArray, EmptyObject, typeIs } from '../common';
import { Component, VNode } from './types';

export function h(
    type: string | Component,
    props: any,
    ...children: any[]
): { type: string | Component; props: any; children: VNode[] } {
    const retChild: VNode[] = children.map(vnodeify);
    return {
        type,
        props: props || undefined,
        children: (retChild || []).flat(Infinity),
    };
}

export const vnodeify = (children: any): VNode => {
    switch (typeof children) {
        case 'object': {
            if (isRef(children)) {
                return {
                    type: '[Obejct Ref]',
                    props: undefined,
                    children: EmptyArray as VNode[],
                    content: children,
                };
            }
            return children;
        }
        default: {
            return {
                type: typeIs(children),
                props: undefined,
                children: EmptyArray as VNode[],
                content: children,
            };
        }
    }
};
