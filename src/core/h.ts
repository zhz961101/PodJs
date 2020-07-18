import flatten from 'lodash/flatten';
import { EmptyArray, EmptyObject, typeIs } from '../common';
import { Component, VNode } from './types';
import { isRef } from '@vue/reactivity';

export function h(
    type: string | Component,
    props: any,
    ...children: any[]
): { type: string | Component; props: any; children: VNode[] } {
    const retChild: VNode[] = children.map(vnodeify);
    return { type, props, children: flatten(retChild) };
}

export const vnodeify = (children: any): VNode => {
    switch (typeof children) {
        case 'object': {
            if (isRef(children)) {
                return {
                    type: "[Obejct Ref]",
                    props: EmptyObject,
                    children: EmptyArray as VNode[],
                    content: children,
                }
            }
            return children;
        }
        default: {
            return {
                type: typeIs(children),
                props: EmptyObject,
                children: EmptyArray as VNode[],
                content: children,
            };
        }
    }
}