import { useReducers } from './useReducers';

const reducers = {
    on() {
        return true;
    },
    off() {
        return false;
    },
    toggle(value: boolean) {
        return !value;
    },
};

export const useBoolean = (inital = false) => {
    return useReducers(reducers, inital);
};

export const useSwitch = (inital = false) => {
    const [value, { on, off, toggle }] = useBoolean(inital);
    return [value, on, off, toggle] as const;
};

export function useToggle(initialValue: boolean = false) {
    const [value, { toggle }] = useBoolean(initialValue);
    return [value, toggle] as const;
}
