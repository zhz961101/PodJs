import { useRef, useWatch } from '../../hook';
import {
    createComponentNode,
    SyncFunctionComponent,
    // AsyncFunctionComponent,
} from '../../types';
import { Component } from '../../core';
import { useSuspenseAdapter } from '../Suspense/Suspense';

// FIXME: 这里加上AsyncFunctionComponent有类型错误，按道理应该没问题
type Render<Props = {}> = SyncFunctionComponent<Props>;

export function lazy<Props>(
    factory: () => Promise<Render<Props>>,
): Render<Props> {
    let cachedType: Render<Props>;
    return () => {
        const metaType = useRef<Render<Props> | null>(null);
        const componet = useRef(
            () =>
                new Component(
                    createComponentNode(
                        () =>
                            metaType.value &&
                            typeof metaType.value === 'function' &&
                            metaType.value(),
                    ),
                ),
        );
        const adapter = useSuspenseAdapter();
        useWatch(null, () => {
            if (metaType.value) {
                return adapter(Promise.resolve());
            }
            if (cachedType) {
                return (metaType.value = cachedType);
            }
            const p = factory();
            adapter(p);
            p.then(
                type => (cachedType = metaType.value = metaType.value || type),
            );
        });
        return componet.value.vnode;
    };
}
