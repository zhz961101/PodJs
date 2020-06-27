import htm from 'htm';
import flatten from 'lodash/flatten';
import { EmptyArray, EmptyObject, typeIs } from './common';
import { Component, VNode } from './types';

export function h(
    type: string | Component,
    props: any,
    ...children: any[]
): { type: string | Component; props: any; children: VNode[] } {
    const retChild: VNode[] = children.map(child => {
        switch (typeof child) {
            case 'object': {
                return child;
            }
            default: {
                return {
                    type: typeIs(child),
                    props: EmptyObject,
                    children: EmptyArray,
                    content: child,
                };
            }
        }
    });
    return { type, props, children: flatten(retChild) };
}

export const html = htm.bind(h) as HtmlTmp;
type HtmlTmp = (strings: TemplateStringsArray, ...values: any[]) => VNode;
