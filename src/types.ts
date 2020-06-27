import { HoxCtx } from './hox'

// const ComponentSymbol = Symbol("ComponentSymbol");
// export const defComponent = (fn) => fn && typeof fn === "function" ? fn[ComponentSymbol] = true : void (0);
// export const isComponent = (fn) => fn && typeof fn === "function" && fn[ComponentSymbol];

export type Component = ((props: object, children: VNode[]) => VNode | null | VNode[]);

export interface VNode {
    type: string | Component;
    props: {
        key?: string,
        [key: string]: any,
    };
    children: VNode[];
    content?: any;

    real_dom?: HTMLElement;
    // fragment
    real_dom_left?: Comment;
    real_dom_right?: Comment;

    hoxCtx?: HoxCtx;
}