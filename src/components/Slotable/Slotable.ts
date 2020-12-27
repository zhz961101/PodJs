import { MetaComponent, MetaProps, VNode } from '../../types';

export interface SlotableProps {
    slots?: VNode[];
    namedSlots?: Map<string, VNode>;
}

export const Slotable = <Props>(
    componentFactory: MetaComponent<MetaProps & Props & SlotableProps>,
) => {
    const ret = function SlotableComponent(props: MetaProps & Props) {
        const { children } = props;
        const slots = children.filter(v => 'slot' in v.props);
        const namedSlots = new Map<string, VNode>();
        slots
            .filter(slot => typeof slot.props.slot === 'string')
            .forEach(slot => namedSlots.set(slot.props.slot as string, slot));
        return componentFactory({ ...props, slots, namedSlots });
    } as MetaComponent<MetaProps & Props>;
    ret.displayName = componentFactory.displayName;
    return ret;
};

// eg:
// import { h } from '../../core';
// const Article = Slotable<{fontSize: number}>((props) => {
//     const { fontSize, slots } = props;
//     return [h('h1', null, slots[0])];
// });
