import { Ref } from '@vue/reactivity';
import { Component } from './core';

export type KVMap<Value = any> = Record<string | number | symbol, Value>;

export const isVNodeSymbol = Symbol('isVNode');
export interface VNode<Props extends KVMap = any> {
    [isVNodeSymbol]: true;

    type: string | MetaComponent<Props>;
    props?: Props;
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
export interface VComponentNode<Props extends KVMap = {}> extends VNode<Props> {
    [isComponentSymbol]: true;

    props?: Props;
    type: MetaComponent<Props>;
}
export const createComponentNode = <Props>(
    type: MetaComponent<Props>,
): VComponentNode<Props> => ({
    [isVNodeSymbol]: true,
    [isComponentSymbol]: true,
    [isAsyncComponentSymbol]: isAsyncGenerator(type),
    type,
    props: {} as Props,
});
export const isAsyncComponentSymbol = Symbol('isAsyncComponent');
export interface VAsyncComponentNode<Props extends KVMap = {}>
    extends VNode<Props> {
    [isAsyncComponentSymbol]: true;

    props?: Props;
    type: AsyncFunctionComponent<Props>;
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
    ref?: Ref<any>;
    key?: string | number | Symbol;
}

interface FunctionComponent<Ret, Props = {}> {
    (props?: MetaProps & Props): Ret;

    displayName?: string;
    defaultProps?: Props;
}

export type SyncFunctionComponent<Props = {}> = FunctionComponent<
    ViewItem | ViewItem[] | Ref<ViewItem | ViewItem[]>,
    Props
>;

export type AsyncFunctionComponent<Props = {}> = FunctionComponent<
    AsyncGenerator<
        ViewItem | ViewItem[] | never,
        ViewItem | ViewItem[] | never,
        unknown
    >,
    Props
>;

export type PartialComponent<Props = {}> = FunctionComponent<
    SyncFunctionComponent<Props> | AsyncFunctionComponent<Props>,
    Props
>;

export type MetaComponent<Props = {}> =
    | SyncFunctionComponent<Props>
    | AsyncFunctionComponent<Props>
    | PartialComponent<Props>;

export const isAsyncGenerator = <T = any, TR = any, TN = any>(
    x: unknown,
): x is AsyncGenerator<T, TR, TN> =>
    typeof x === 'object' && Symbol.asyncIterator in x;
