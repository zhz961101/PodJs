import { StyleOptions, useStyle } from '../hox/useStyle';
import { html } from '../index';

const defaultOptions = {
    size: 12,
    colGap: '0.5rem',
    rowGap: '0.5rem',
    justify: 'start' as
        | 'start'
        | 'end'
        | 'center'
        | 'justify'
        | 'space-between'
        | 'space-around',
    style: null as StyleOptions | null,
};

const RowStyle = (opt: typeof defaultOptions) => ({
    display: 'grid',
    'grid-template-columns': `repeat(${opt.size}, 1fr)`,
    'column-gap': opt.colGap,
    'row-gap': opt.rowGap,
});

export const Row = (props = defaultOptions, children) => {
    props = { ...defaultOptions, ...props };
    const { styleRef } = useStyle(RowStyle(props));

    return html` <div style=${props.style} ref=${[styleRef]}>${children}</div> `;
};

const defaultColProps = {
    span: 1,
    start: 0,
    style: null as StyleOptions | null,
};

const ColStyle = (span: number, start: number) =>
    Object.assign(
        {
            'grid-column-end': `span ${span}`,
            position: 'relative',
        },
        start
            ? {
                'grid-column-start': start,
            }
            : {},
    );

export const Col = (props: typeof defaultColProps, children) => {
    const { span, start, style } = props;
    const { styleRef } = useStyle(ColStyle(span, start));

    return html` <div style=${style} ref=${[styleRef]}>${children}</div> `;
};
