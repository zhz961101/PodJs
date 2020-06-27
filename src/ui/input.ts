import { GetValue } from '../hox/common';
import { useEffect } from '../hox/index';
import { useEventListener } from '../hox/useEventListener';
import { useStyle } from '../hox/useStyle';
import { html } from '../index';
import { excludeKeysObj } from './common';

const InputStyle = {
    'box-sizing': 'border-box',
    margin: '0',
    'font-variant': 'tabular-nums',
    'list-style': 'none',
    'font-feature-settings': "'tnum'",
    position: 'relative',
    display: 'inline-block',
    height: '32px',
    padding: '4px 11px',
    color: 'rgba(0, 0, 0, 0.65)',
    'font-size': '14px',
    'line-height': '1.5',
    'background-color': '#fff',
    'background-image': 'none',
    border: '1px solid #d9d9d9',
    'border-radius': '4px',
    transition: 'all 0.3s',

    '&:hover': {
        'border-color': '#40a9ff',
        'border-right-width': '1px !important',
    },
    i: {
        'font-size': '14px',
        'line-height': '1.499',
    },
    '*:not(input)': {
        'user-select': 'none',
    },
};

const InnerInputStyle = {
    border: '0',
    outline: '0',
    'box-shadow': 'none !important',
    padding: '0',
    height: 'auto',
};

const inputPlaceholderStyle = {
    '&::-webkit-input-placeholder': {
        color: '#bfbfbf',
        opacity: '1',
    },
    '&:placeholder-shown': {
        'text-overflow': 'ellipsis',
    },
};

const focusStyle = {
    'border-color': '#40a9ff',
    'border-right-width': '1px !important',
    outline: '0',
    'box-shadow': '0 0 0 2px rgba(24, 144, 255, 0.2)',
};

const disabledStyle = {
    cursor: 'not-allowed',
    color: 'rgba(0, 0, 0, 0.25)',
    'background-color': '#f5f5f5',
    '&:hover': {
        border: '1px solid #d9d9d9',
    },
    input: {
        cursor: 'not-allowed',
        color: 'rgba(0, 0, 0, 0.25)',
        'background-color': 'transparent',
    },
};

interface InputProps {
    size: 'large' | 'medium' | 'small';
    prefix?: any;
    suffix?: any;
}

export const Input = (props: InputProps) => {
    const { prefix, suffix } = props;
    const { styleRef: inputStyleRef } = useStyle(InputStyle);
    const { styleRef: innerStyleRef } = useStyle({ ...InnerInputStyle, ...inputPlaceholderStyle });
    const { styleRef: inputFocusStyle, add, remove } = useStyle(focusStyle, false);
    const { styleRef: inputDisabledStyle, add: disableAdd, remove: disableRemove } = useStyle(
        disabledStyle,
        false,
    );

    useEffect(() => {
        const disabled = GetValue<boolean>((props as any).disabled);
        if (disabled) {
            disableAdd();
        } else {
            disableRemove();
        }
    });

    const focusRef = useEventListener('focus', add);
    const blurRef = useEventListener('blur', remove);

    let innerRef: HTMLElement = null;

    return html`
        <div
            ref=${[
                inputStyleRef,
                inputFocusStyle,
                inputDisabledStyle,
                elem => elem.addEventListener('click', () => innerRef && innerRef.focus()),
            ]}
            ${{ style: (props as any).style }}
        >
            ${() =>
                !prefix
                    ? ''
                    : html`
                          <span class="input-group-prefix">${prefix}</span>
                      `}
            <input
                ref=${[innerStyleRef, focusRef, blurRef, elem => (innerRef = elem)]}
                ${excludeKeysObj(props, ['size', 'style', 'prefix', 'suffix'])}
            />
            ${() =>
                !suffix
                    ? ''
                    : html`
                          <span class="input-group-suffix">${suffix}</span>
                      `}
        </div>
    `;
};

interface TextareaProps {
    value?: string;
}

export const Textarea = (props: TextareaProps) => {
    const { value } = props;
    const { styleRef } = useStyle({
        ...InputStyle,
        ...inputPlaceholderStyle,
        '&:focus': focusStyle,
    });

    return html`
        <textarea ref=${[styleRef]} ${excludeKeysObj(props, ['value'])}>
${() => GetValue(value)}</textarea
        >
    `;
};
