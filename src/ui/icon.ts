import { html } from '../index';
import { excludeKeysObj, isIncluded } from './common';

interface IconProps {
    name: string;
    theme?: 'sharp' | 'outlined' | 'round' | 'tow-tone';
    [key: string]: any;
}

const MaterialIconCssURL =
    'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Sharp|Material+Icons+Round|Material+Icons+Two+Tone';

const includeMaterialIconCss = () => {
    if (isIncluded(MaterialIconCssURL)) {
        return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MaterialIconCssURL;
    document.head.appendChild(link);
};

export const Icon = (props: IconProps) => {
    const { name, theme } = props;

    includeMaterialIconCss();

    return html`
        <i
            class=${'material-icons' + (theme ? `-${theme}` : '')}
            ${excludeKeysObj(props, ['name', 'theme'])}
            >${name}</i
        >
    `;
};
