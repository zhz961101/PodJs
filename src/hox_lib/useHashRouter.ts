import { useEffect } from '../hox/useEffect';
import { reactive } from '@vue/reactivity';
import { html } from '../h';

interface RouterRoutes {
    [key: string]: (arg: { pathName: string; params?: { [key: string]: string } }) => any;
}

const escapeRegExp = str => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

const defaultNotFound = () => html`
    <h1>Not Found</h1>
    <p>Please try the following:</p>
    <ul>
        <li>
            <a href="#">Back index page.</a>
        </li>
        <li>
            <a href="javascript:void(0)" onclick=${() => history.back()}>
                Back to previous page.
            </a>
        </li>
        <li>
            <a href="javascript:void(0)" onclick=${() => window.location.reload()}
                >Refresh this page.</a
            >
        </li>
    </ul>
    NO_MATCHING_ROUTE_FOUND
`;

export const useHashRouter = (routes: RouterRoutes) => {
    const routerState = reactive({
        currentComponent: null,
        pathName: '',
    });
    // bindEvents
    const refresh = () => (routerState.pathName = location.hash.slice(1) || '/');
    window.addEventListener('hashchange', refresh, false);
    window.addEventListener('load', refresh, false);

    // dataInit
    const strRoutes = Object.keys(routes).filter(k => !k.includes(':'));
    const regRoutes = Object.keys(routes)
        .filter(k => k.includes(':'))
        .map(regRule => {
            let regString = regRule
                .split(/:[a-zA-Z0-9-_]*/)
                .map(escapeRegExp)
                .join('([a-zA-Z0-9-_]*)');
            regString = '^' + regString + '$';
            const reg = new RegExp(regString);
            const parameterNames = regRule
                .match(/\:([a-zA-Z0-9-_]*)/g)
                .map(match => match.replace(/^:/, ''));
            const test = (pathName: string) => {
                const parameterValues = [...(reg.exec(pathName) || [])];
                if (parameterValues.length !== 0) {
                    parameterValues.shift();
                    const finalParameters = {};
                    parameterNames.forEach((key, i) => (finalParameters[key] = parameterValues[i]));
                    return finalParameters;
                }
                return null;
            };
            return { regRule, test };
        });

    // effect
    useEffect(() => {
        const { pathName } = routerState;
        if (!pathName) {
            return;
        }
        if (strRoutes.includes(pathName)) {
            const component = routes[pathName]({ pathName, params: {} });
            routerState.currentComponent = component;
            return;
        }
        for (const route of regRoutes) {
            const { test, regRule: key } = route;
            const params = test(pathName);
            if (params) {
                const component = routes[key]({ pathName, params });
                routerState.currentComponent = component;
                return;
            }
        }
        // not found
        if (strRoutes.includes('*')) {
            const component = routes['(']({ pathName, params: {} });
            routerState.currentComponent = component;
            return;
        }
        // defaultNotFound
        routerState.currentComponent = defaultNotFound();
    });

    // Router Component
    return html`
        <div>${() => routerState.currentComponent}</div>
    `;
};
