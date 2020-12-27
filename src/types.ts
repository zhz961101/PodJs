import { Ref } from '@vue/reactivity';
import { Component } from './core';

export type KVMap = Record<string | number | symbol, unknown>;

export const isVNodeSymbol = Symbol('isVNode');
export interface VNode {
    [isVNodeSymbol]: true;

    type: string | MetaComponent;
    props?: KVMap;
    children?: VNode[];

    _dom?: null | Node;
    _component?: Component;

    [isTextSymbol]?: boolean;
    content?: string;

    [isComponentSymbol]?: boolean;
    [isAsyncComponentSymbol]?: boolean;
}
export const createVNode = (
    type: string | MetaComponent<unknown>,
    props: KVMap,
    children: VNode[],
    content?: string,
): VNode => ({
    [isVNodeSymbol]: true,
    type,
    props,
    children,
    content,
});
export const isTextSymbol = Symbol('isText');
export interface VTextNode extends VNode {
    [isTextSymbol]: true;

    type: '#text';
    content: string;
}
export const createTextNode = (content: string): VTextNode => ({
    [isVNodeSymbol]: true,
    [isTextSymbol]: true,
    type: '#text',
    content,
    children: [],
    _dom: null,
    props: {},
});
export const isComponentSymbol = Symbol('isComponent');
export interface VComponentNode<Props extends KVMap = {}> extends VNode {
    [isComponentSymbol]: true;

    props?: Props;
    type: MetaComponent<Props>;
}
export const createComponentNode = (type: MetaComponent): VComponentNode => ({
    [isVNodeSymbol]: true,
    [isComponentSymbol]: true,
    type,
});
export const isAsyncComponentSymbol = Symbol('isAsyncComponent');
export interface VAsyncComponentNode<Props extends KVMap = {}> extends VNode {
    [isAsyncComponentSymbol]: true;

    props?: Props;
    type: MetaAsyncGeneratorComponent<Props>;
}
export const isVNode = (x: unknown): x is VNode =>
    x && x[isVNodeSymbol] === true;
export const isText = (x: unknown): x is VTextNode =>
    x && x[isTextSymbol] === true;
export const isComponent = (x: unknown): x is VComponentNode =>
    x && x[isComponentSymbol] === true;

export const isAsyncComponent = (x: unknown): x is VAsyncComponentNode =>
    x && x[isAsyncComponentSymbol] === true;

type _VNode =
    | VNode
    | VTextNode
    | VComponentNode<any>
    | VAsyncComponentNode<any>;
export type ViewItem = string | number | void | null | _VNode;

export interface MetaProps {
    children?: VNode[];
}
type _MetaComponent<Props, ComponentRet> = (
    props?: MetaProps & Props,
) => ComponentRet;

export interface MetaSyncComponent<Props = {}> {
    (props?: MetaProps & Props):
        | ViewItem
        | ViewItem[]
        | Ref<ViewItem | ViewItem[]>;
    displayName?: string;
}
export interface MetaAsyncGeneratorComponent<Props = {}> {
    (props?: MetaProps & Props): AsyncGenerator<
        ViewItem | ViewItem[] | never,
        ViewItem | ViewItem[] | never,
        unknown
    >;
    displayName?: string;
}
// export type MetaComponent<Props = {}> =
//     | _MetaComponent<Props, ViewItem | ViewItem[]>
//     | _MetaComponent<Props, Ref<ViewItem | ViewItem[]>>
//     | MetaAsyncGeneratorComponent<Props>;

export interface MetaComponent<Props = {}> {
    (props?: MetaProps & Props):
        | ViewItem
        | ViewItem[]
        | Ref<ViewItem | ViewItem[]>
        | AsyncGenerator<
              ViewItem | ViewItem[] | never,
              ViewItem | ViewItem[] | never,
              unknown
          >;
    // (): ViewItem;
    // (): ViewItem[];
    // (): Ref<ViewItem | ViewItem[]>;
    // (): AsyncGenerator<
    //     ViewItem | ViewItem[] | never,
    //     ViewItem | ViewItem[] | never,
    //     unknown
    // >;
    // (props?: MetaProps & Props): ViewItem;
    // (props?: MetaProps & Props): ViewItem[];
    // (props?: MetaProps & Props): Ref<ViewItem | ViewItem[]>;
    // (props?: MetaProps & Props): AsyncGenerator<
    //     ViewItem | ViewItem[] | never,
    //     ViewItem | ViewItem[] | never,
    //     unknown
    // >;
    displayName?: string;
}

export const isAsyncGenerator = <T = any, TR = any, TN = any>(
    x: unknown,
): x is AsyncGenerator<T, TR, TN> =>
    typeof x === 'object' && Symbol.asyncIterator in x;
