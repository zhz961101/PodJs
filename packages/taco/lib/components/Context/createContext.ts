import { MetaProps, MetaComponent } from '../../types';
import { useInstance } from '../../hook';

interface ProviderProps<T> {
    value: T;
}

export const createContext = <ContextPayload>(
    defaultContext: ContextPayload,
    key = Symbol('anonymous') as keyof any,
) => {
    const Provider = (props: MetaProps & ProviderProps<ContextPayload>) => {
        const ins = useInstance();
        ins.context[key as string] = props.value;
        return props.children;
    };
    const useContext = (): ContextPayload => {
        const ins = useInstance();
        return ins.getContextValue(key) || defaultContext;
    };
    return [
        Provider as MetaComponent<ProviderProps<ContextPayload>>,
        useContext,
    ] as const;
};
