import { useEffect } from '../core/useEffect';
import { useState } from '../core/useState';
import { toRaw } from '@vue/reactivity';

const VersionKey = `@tacopia/taco/hox/useStoregeState/versions`;
const Storage2Versions = new WeakMap<Storage, Record<string, number>>();

const getVerMap = (factory: Storage): Record<string, number> => {
    try {
        const map = (JSON.parse(factory.getItem(VersionKey)) as unknown) as Record<
            string,
            number
        >;
        if (!map) {
            return {};
        }
        return map;
    } catch (error) {
        return {};
    }
};

const getVersion = (key: string, factory: Storage) => {
    if (!Storage2Versions.has(factory)) {
        Storage2Versions.set(factory, getVerMap(factory));
    }
    return Storage2Versions.get(factory)[key];
};

const setVersion = (key: string, version: number, factory: Storage) => {
    if (!Storage2Versions.has(factory)) {
        Storage2Versions.set(factory, {});
    }
    if (Storage2Versions.get(factory)[key] !== version) {
        Storage2Versions.get(factory)[key] = version;
        const verMap = getVerMap(factory);
        try {
            factory.setItem(
                VersionKey,
                JSON.stringify({ ...verMap, [key]: version }),
            );
        } catch (error) {
            console.warn(error);
        }
    }
};

const needUpdate = (key: string, version: number, factory: Storage) => {
    return getVersion(key, factory) !== version;
};

export const createUseStorageState = (factory: Storage) => {
    return (key: string, initialState: any, version: number = 0) => {
        const [getter, setter, value] = useState(() => {
            if (needUpdate(key, version, factory)) {
                setVersion(key, version, factory);
                return initialState;
            }
            try {
                return JSON.parse(factory.getItem(key));
            } catch (err) {
                return initialState;
            }
        });
        useEffect(() => {
            const val = value.value;
            const raw = toRaw(val);
            if (Array.isArray(raw)) {
                // track array change
                `${value.value.length}`;
            }
            factory.setItem(key, JSON.stringify(toRaw(val)));
        });
        return value;
    };
};

export const useSessionState = createUseStorageState(sessionStorage);

export const useLocalState = createUseStorageState(localStorage);
