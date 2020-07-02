import { Ref } from '@vue/reactivity';
import { GetValue } from '../hox/common';
import { useEffect } from '../hox/useEffect';
import { useEventListener } from '../hox/useEventListener';
import { useMotion } from '../hox/useMotion';
import { StyleOptions, useStyle } from '../hox/useStyle';
import { html } from '../index';
import { excludeKeysObj } from './common';
import { Icon } from './icon';

const ButtonStyle = {
    'line-height': '1.499',
    position: 'relative',
    display: 'inline-block',
    'font-weight': 400,
    'white-space': 'nowrap',
    'text-align': 'center',
    'background-image': 'none',
    border: '1px solid transparent',
    'box-shadow': '0 2px 0 rgba(0, 0, 0, 0.015)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
    'user-select': 'none',
    'touch-action': 'manipulation',
    height: '32px',
    padding: '0 15px',
    'font-size': '14px',
    'border-radius': '4px',
    color: 'rgba(0, 0, 0, 0.65)',
    'background-color': '#fff',
    'border-color': '#d9d9d9',
    outline: '0',

    // icon
    '> i': {
        'font-size': '14px',
        'line-height': '1.499',
    },
    '&.loading': {
        'pointer-events': 'none',
        '&::before': {
            display: 'block',
            position: 'absolute',
            top: '-1px',
            right: '-1px',
            bottom: '-1px',
            left: '-1px',
            'z-index': '1',
            background: '#fff',
            'border-radius': 'inherit',
            opacity: '0.35',
            transition: 'opacity 0.2s',
            content: '',
            'pointer-events': 'none',
        },
    },

    '&:focus,&:hover': {
        color: '#40a9ff',
        'background-color': '#fff',
        'border-color': '#40a9ff',
        'text-decoration': 'none',
        background: '#fff',
    },

    '&:active': {
        color: '#096dd9',
        'background-color': '#fff',
        'border-color': '#096dd9',
        '-webkit-box-shadow': 'none',
        'box-shadow': 'none',
    },
};

const dashedStyle = {
    color: 'rgba(0, 0, 0, 0.65)',
    'background-color': '#fff',
    'border-color': '#d9d9d9',
    'border-style': 'dashed',
};

const primaryStyle = {
    color: '#fff',
    'background-color': '#1890ff',
    'border-color': '#1890ff',
    'text-shadow': '0 -1px 0 rgba(0, 0, 0, 0.12)',
    'box-shadow': '0 2px 0 rgba(0, 0, 0, 0.045)',
    '&:focus,&:hover': {
        color: '#fff',
        'background-color': '#40a9ff',
        'border-color': '#40a9ff',
    },
    '&:active': {
        color: '#fff',
        'background-color': '#096dd9',
        'border-color': '#096dd9',
    },
};

const circleStyle = {
    'min-width': '32px',
    'padding-right': '0',
    'padding-left': '0',
    'text-align': 'center',
    'border-radius': '50%',
};

const roundedStyle = {
    height: '32px',
    padding: '0 16px',
    'font-size': '14px',
    'border-radius': '32px',
};

const dangerStyle = {
    color: '#fff',
    'background-color': '#ff4d4f',
    'border-color': '#ff4d4f',
    'text-shadow': '0 -1px 0 rgba(0, 0, 0, 0.12)',
    'box-shadow': '0 2px 0 rgba(0, 0, 0, 0.045)',
    '&:focus,&:hover': {
        color: '#fff',
        'background-color': '#ff7875',
        'border-color': '#ff7875',
    },
    '&:active': {
        color: '#fff',
        'background-color': '#d9363e',
        'border-color': '#d9363e',
    },
};

const linkStyle = {
    border: 0,
    color: '#1890ff',
    'text-decoration': 'none',
    'background-color': 'transparent',
    outline: 'none',
    cursor: 'pointer',
    'touch-action': 'manipulation',
    transition: 'color 0.3s ease',

    '&:focus,&:hover': {
        color: '#40a9ff',
    },
    '&:active': {
        color: '#096dd9',
    },
};

const disabledStyle = {
    color: 'rgba(0, 0, 0, 0.25) !important',
    'background-color': '#f5f5f5 !important',
    'border-color': '#d9d9d9 !important',
    'text-shadow': 'none',
    'box-shadow': 'none',
    cursor: 'not-allowed !important',
    'user-select': 'none',
    '&:focus,&:hover': {
        color: 'rgba(0, 0, 0, 0.25) !important',
        'background-color': '#f5f5f5 !important',
        'border-color': '#d9d9d9 !important',
    },
    '&:active': {
        color: 'rgba(0, 0, 0, 0.25) !important',
        'background-color': '#f5f5f5 !important',
        'border-color': '#d9d9d9 !important',
    },
    '>*': {
        'user-select': 'none',
        'pointer-events': 'none',
    },
};

const getBtnStyle = (type = '', shape = '', disable = false) => {
    let style: StyleOptions = { ...ButtonStyle };
    switch (type.toLowerCase()) {
        case 'primary':
            style = { ...style, ...primaryStyle };
            break;
        case 'dashed':
            style = { ...style, ...dashedStyle };
            break;
        case 'danger':
            style = { ...style, ...dangerStyle };
            break;
        case 'link':
            style = { ...style, ...linkStyle };
            break;
    }
    switch (shape.toLowerCase()) {
        case 'circle':
            style = { ...style, ...circleStyle };
            break;
        case 'round':
            style = { ...style, ...roundedStyle };
            break;
    }
    return style;
};

const activeMotion = [
    {
        'box-shadow': '0 0 0 0px rgba(64, 169, 255, .3)',
    },
    {
        'box-shadow': '0 0 0 0.5rem rgba(64, 169, 255, .0)',
        ease: 'ease-in',
        duration: 300,
    },
    {
        'box-shadow': '0 0 0 0.5rem rgba(64, 169, 255, .0)',
        duration: 100,
        delay: 100,
    },
];

const dangerActiveMotion = [
    {
        'box-shadow': '0 0 0 0px rgba(255, 77, 79, .3)',
    },
    {
        'box-shadow': '0 0 0 0.5rem rgba(255, 77, 79, .0)',
        ease: 'ease-in',
        duration: 300,
    },
    {
        'box-shadow': '0 0 0 0.5rem rgba(255, 77, 79, .0)',
        duration: 100,
        delay: 100,
    },
];

interface ButtonProps {
    type?: 'primary' | 'dashed' | 'danger' | 'link';
    text?: string;
    style?: StyleOptions;
    shape?: 'circle' | 'round';
    icon?: string;
    disabled?: boolean | Ref<boolean>;
    loading?: boolean | Ref<boolean>;
    ref?: (elem: HTMLElement) => void;
}

export const Button = (props: ButtonProps = {}) => {
    const { type, text, style, shape, icon, ref, disabled, loading } = props;
    const { styleRef: propsStyleRef } = useStyle(style);
    const { styleRef } = useStyle(getBtnStyle(type, shape, GetValue(disabled)));
    const { motionRef, start: activeStart } = useMotion(
        type === 'danger' ? dangerActiveMotion : activeMotion,
    );
    const {
        styleRef: disabledStyleRef,
        add: addDisabled,
        remove: removeDisabled,
    } = useStyle(disabledStyle, false);

    let mouseupRef = null;
    if (type !== 'link' && !GetValue(disabled)) {
        mouseupRef = useEventListener('mouseup', activeStart);
    }

    useEffect(() => {
        if (GetValue(disabled)) {
            addDisabled();
        } else {
            removeDisabled();
        }
    });

    return html`
        <button
            ${excludeKeysObj(props, [
                'type',
                'text',
                'style',
                'shape',
                'icon',
                'ref',
                'disabled',
                'loading',
            ])}
            type="button"
            ref=${[
                styleRef,
                propsStyleRef,
                motionRef,
                mouseupRef,
                ref,
                disabledStyleRef,
            ]}
            disabled=${() => GetValue(disabled)}
            class=${() => (GetValue(loading) ? 'loading' : '')}
        >
            ${() =>
                !GetValue(loading)
                    ? ''
                    : Icon({
                          name: 'donut_large',
                          style: {
                              animation: 'loadingCircle 1s infinite linear',
                          },
                      })}
            ${() => (!icon || GetValue(loading) ? '' : Icon({ name: icon }))}
            ${() => (!text ? '' : html` <span>${text}</span> `)}
        </button>
    `;
};

const ButtonGroupStyle = {
    position: 'relative',
    display: 'inline-block',
    button: {
        'border-radius': 0,
        position: 'relative',
        '&:active,&:hover,&:focus': {
            'z-index': 1,
        },
        '+ button': {
            'margin-left': '-5px',
        },
        '&:first-child:not(:last-child)': {
            'border-top-left-radius': '4px',
            'border-bottom-left-radius': '4px',
        },
        '&:last-child:not(:first-child)': {
            'border-top-right-radius': '4px',
            'border-bottom-right-radius': '4px',
        },
    },
};

export const ButtonGroup = (btns: any[]) => {
    const { styleRef } = useStyle(ButtonGroupStyle);
    return html` <div ref=${[styleRef]}>${btns}</div> `;
};

Button.Group = ButtonGroup;
