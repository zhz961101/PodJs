import { useEffect } from './useEffect';
import { useState } from './useState';

export const useSessionState = (key: string, initialState: any) => {
    const [getter, setter, value] = useState(
        () => sessionStorage.getItem(key) || initialState,
    );
    useEffect(() => {
        sessionStorage.setItem(key, value.value);
    });
    return value;
};

export const useLocalState = (key: string, initialState: any) => {
    const [getter, setter, value] = useState(
        () => localStorage.getItem(key) || initialState,
    );
    useEffect(() => {
        localStorage.setItem(key, value.value);
    });
    return value;
};
