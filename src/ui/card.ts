import { StyleOptions, useStyle } from '../hox/useStyle';
import { html } from '../index';
import { excludeKeysObj, isUnDefAll } from './common';

const CardStyle = {
    width: '300px',
    margin: '0.5rem',
    display: 'inline-block',
    border: '1px solid #e8e8e8',
    'box-sizing': 'border-box',
    padding: 0,
    color: 'rgba(0, 0, 0, 0.65)',
    'font-size': '14px',
    'font-variant': 'tabular-nums',
    'line-height': '1.5',
    'list-style': 'none',
    'font-feature-settings': 'tnum',
    position: 'relative',
    background: '#fff',
    'border-radius': '2px',
    transition: 'all 0.3s',

    '.card-header': {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',

        'min-height': '48px',
        padding: '0 24px',
        color: 'rgba(0, 0, 0, 0.85)',
        'font-size': '16px',
        'font-weight': 500,
        background: 'transparent',
        zoom: 1,

        'border-bottom': '1px solid #e8e8e8',
        'margin-bottom': '-1px',
        'border-radius': '2px 2px 0 0',

        a: {
            color: '#1890ff',
            'text-decoration': 'none',
            'background-color': 'transparent',
            outline: 'none',
            cursor: 'pointer',
            'touch-action': 'manipulation',
            transition: 'color 0.3s ease',

            '&:hover': {
                color: '#40a9ff',
            },
            '&:active': {
                color: '#096dd9',
            },
        },
    },
    '.card-actions': {
        margin: 0,
        padding: 0,
        'list-style': 'none',
        background: '#fafafa',
        'border-top': '1px solid #e8e8e8',
        zoom: 1,
        display: 'flex',
        '& > *': {
            flex: '1',
            'border-right': '1px solid #e8e8e8',
            float: 'left',
            margin: '12px 0',
            color: 'rgba(0, 0, 0, 0.45)',
            'text-align': 'center',
            cursor: 'pointer',

            '&:hover': {
                color: '#1890ff',
            },
        },
    },
    '.card-content': {
        padding: '24px',
        zoom: 1,
    },
    '.card-cover': {
        'max-height': '20rem',
        overflow: 'hidden',
        '& > *': {
            display: 'block',
            width: '100%',
        },
    },
};

const shadowStyle = {
    '&:hover': {
        'border-color': 'rgba(0, 0, 0, 0.09)',
        'box-shadow': '0 2px 8px rgba(0, 0, 0, 0.09)',
    },
};

interface CardProps {
    title?: string | DocumentFragment;
    extra?: string | DocumentFragment;
    content?: string | DocumentFragment;
    actions?: Array<string | DocumentFragment>;
    cover?: string | DocumentFragment;
    size?: string;
}

export const Card = (props: CardProps = {}) => {
    const { title, extra, actions, cover } = props;
    let { content } = props;

    if (isUnDefAll([title, actions, content])) {
        content = 'Here is Empty Configuretion Card.';
    }

    const { styleRef: hoverShadow } = useStyle(shadowStyle);

    const { styleRef: cardRef } = useStyle(CardStyle);

    return html`
        <div
            ref=${[cardRef, hoverShadow, (props as any).ref]}
            class="card"
            ${excludeKeysObj(props, ['title', 'extra', 'actions', 'cover', 'content'])}
        >
            ${() =>
                !cover
                    ? ''
                    : html`
                          <div class="card-cover">
                              ${() => cover}
                          </div>
                      `}
            ${() =>
                !title
                    ? ''
                    : html`
                          <header class="card-header">
                              <div class="card-title">
                                  ${() => title}
                              </div>
                              <div class="card-extra">
                                  ${() => extra}
                              </div>
                          </header>
                      `}
            ${() =>
                !content
                    ? ''
                    : html`
                          <div class="card-content">
                              ${() => content}
                          </div>
                      `}
            ${() =>
                !actions
                    ? ''
                    : html`
                          <footer class="card-actions">
                              ${() =>
                                  actions.map(
                                      inner =>
                                          html`
                                              <div>${inner}</div>
                                          `,
                                  )}
                          </footer>
                      `}
        </div>
    `;
};
