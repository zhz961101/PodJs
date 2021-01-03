import { MetaComponent, MetaProps, VNode, createVNode } from '@tacopie/taco';
import DIV from './DIV';

export interface GridContinerProps {
    row: number;
    col: number;
    rowArea?: string;
    colArea?: string;
}

const areaStyleText = (length: number, area?: string) => {
    if (!area) return `repeat(${length}, 1fr)`;
    const areas = area.split(' ');
    if (areas.length < length) {
        return [...areas, ...Array(areas.length - length).fill('1fr')].join(
            ' ',
        );
    }
    return areas.join(' ');
};

export const GridContainer: MetaComponent<GridContinerProps> = props => {
    const { row, col, rowArea, colArea } = props;
    return DIV({
        style: {
            display: 'grid',
            'grid-template-columns': areaStyleText(col, colArea),
            'grid-template-rows': areaStyleText(row, rowArea),
        },
        ...props.children,
    });
};
