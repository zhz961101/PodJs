import { Component } from '../../core';
import { createComponentNode, MetaProps } from '../../types';
import { usePtr, useWatch } from '../../hook';

let teleportContainer = null as null | HTMLDivElement;
const useTeleport = () => {
    if (!teleportContainer) {
        teleportContainer = document.createElement('div');
        document.body.appendChild(teleportContainer);
    }
    const ref = usePtr(null as null | HTMLDivElement | Component);
    useWatch(
        () => ref.value,
        component => {
            if (!component) {
                return;
            }
            if (component instanceof Component) {
                if (teleportContainer.contains(component.getAnchor())) {
                    return;
                }
                teleportContainer.appendChild(component.getAnchor());
                component.mountTo(teleportContainer);
                component.mountChildren(component.children);
                return;
            }
            if (teleportContainer.contains(component as HTMLElement)) {
                return;
            }
            teleportContainer.appendChild(component as HTMLElement);
        },
    );
    return ref;
};
export const Teleport = ({ children }: MetaProps) => {
    const component = usePtr(
        () => new Component(createComponentNode(() => [...children])),
    );
    useTeleport().value = component.value;
    return null;
};
