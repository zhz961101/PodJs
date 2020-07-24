import { Component, VNode } from '../core/types';

type CurryableComponent = (...xs: any[]) => ReturnType<Component>;

export const Curryable = (fn: CurryableComponent) => {
    let props = {} as any;
    let children = [] as VNode[];
    function curried(): Component;
    function curried(...args: [object]): typeof curried;
    function curried(...args: [object, VNode[]]): typeof curried;
    function curried(...args: [object, VNode[]] | [object] | [] | undefined) {
        if (args.length === 0) {
            return ((realRrops, realChildren) =>
                fn({ ...props, ...realRrops }, [
                    ...children,
                    ...realChildren,
                ])) as Component;
        }
        const [nextProps, nextChildren] = args;
        if (nextProps) {
            props = { ...props, ...nextProps };
        }
        if (nextChildren) {
            children = [...children, ...nextChildren];
        }
        return curried;
    }
    return curried;
};

// eg:
// const card = Curryable(
//     ({ title, content, footer, closeBtn }, children: VNode[]) => {
//         /// any html
//         return {} as VNode;
//     },
// );

// const simpleCard = card({ title: '', content: '' });
// const AlertCard = simpleCard({ closeBtn: 'any btn component' })();
