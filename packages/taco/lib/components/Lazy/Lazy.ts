import { useRef, useWatch } from '../../hook';
import { createComponentNode, MetaComponent } from '../../types';
import { Component } from '../../core';
import { useSuspenseAdapter } from '../Suspense/Suspense';

export function lazy<Props>(
    factory: () => Promise<MetaComponent<Props>>,
): MetaComponent<Props> {
    let cachedType: MetaComponent<Props>;
    return () => {
        const metaType = useRef<MetaComponent<Props> | null>(null);
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
