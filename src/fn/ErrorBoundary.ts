import { toRaw } from '@vue/reactivity';
import { HoxCtxStack, SetHoxCtxStackVal } from '../core/hox';
import { html } from '../core/html';
import { Component, VNode } from '../core/types';
import { useRef } from '../core/useRef';
import { useValue } from '../hox/useValue';

interface HolderProps {
    error: string | Error;
    name: string;
}

const defaultHolder = ({ name, error }: HolderProps) => {
    console.warn(error);
    return html`<pre type="text/error" name=${name}>${error.toString()}</pre>`;
};

export const ErrorBoundary: Component = (
    { name = 'ErrorBoundary', holder = defaultHolder } = {},
    children,
) => {
    const err = useRef(null as any);
    SetHoxCtxStackVal('onError', e => (err.value = e));
    const result = useValue(() => {
        const error = toRaw(err.value);
        if (error) {
            return html`<${holder} ...${{ name, error }} />`;
        }
        return html`${children}`;
    });
    return html`${() => result.value}`;
};

export const TacoThrow = (err: Error | string | number | null | Symbol) => {
    for (const ctx of HoxCtxStack) {
        if ('onError' in ctx && typeof ctx.onError === 'function') {
            setTimeout(() => {
                /// 由于大部分错误都是副作用产生的，发生副作用的时候想再次激活副作用需要跳出当前的副作用栈，不如会被视为同一个副作用...
                // 类似于事务的概念
                // nextTick
                ctx.onError(err);
            }, 1);
            return;
        }
    }
    throw err;
};
