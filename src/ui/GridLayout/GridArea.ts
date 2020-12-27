import { MetaComponent, MetaProps, VNode, createVNode } from '../../types';
import DIV from './DIV';

interface GridAreaProps {
    areaName?: string;
    x0?: number | string;
    y0?: number | string;
    x1?: number | string;
    y1?: number | string;
}

export const GridArea: MetaComponent<GridAreaProps> = props => {
    const {
        areaName,
        x0 = 'auto',
        y0 = 'auto',
        x1 = 'auto',
        y1 = 'auto',
    } = props;
    return DIV(
        {
            style: {
                'grid-area': areaName
                    ? areaName
                    : `${x0} / ${y0} / ${x1} / ${y1}`,
            },
        },
        ...props.children,
    );
};
