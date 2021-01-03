import { h, MetaComponent } from '@tacopie/taco';
import { mustRequire, once } from './common';

const MaterialIconCssURL =
    'https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Sharp|Material+Icons+Round|Material+Icons+Two+Tone';

const mustLib = once(() =>
    mustRequire(MaterialIconCssURL, false, { rel: 'stylesheet' }),
);

interface IconProps {
    name: string;
    theme?: 'sharp' | 'outlined' | 'round' | 'tow-tone';
}

export const MaterialIcon: MetaComponent<IconProps> = props => {
    mustLib();

    const { name, theme, children, ...rest } = props;
    return h(
        'i',
        {
            ...rest,
            className: `${'material-icons' + (theme ? `-${theme}` : '')}`,
        },
        name,
    );
};
