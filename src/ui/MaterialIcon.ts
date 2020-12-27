import { h } from '../core';
import { excludeKeysObj, isIncluded } from './common';

const MaterialIconCssURL =
    'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Sharp|Material+Icons+Round|Material+Icons+Two+Tone';

let includeMaterialIconCss = () => {
    if (isIncluded(MaterialIconCssURL)) {
        includeMaterialIconCss = () => {};
        return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MaterialIconCssURL;
    document.head.appendChild(link);
};

interface IconProps {
    name: string;
    theme?: 'sharp' | 'outlined' | 'round' | 'tow-tone';
    [key: string]: any;
}

export const MaterialIcon = ({ name, theme, ...rest }: IconProps) => {
    includeMaterialIconCss();

    return h(
        'i',
        {
            ...rest,
            className: `${'material-icons' + (theme ? `-${theme}` : '')}`,
        },
        name,
    );
};
