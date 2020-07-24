import { useEffect } from '../core/useEffect';
import { useState } from '../core/useState';

const VersionKey = `@tacopia/taco/hox/useStoregeState/versions`;
const Storage2Versions = new WeakMap<Storage, Record<string, number>>();

const getVerMap = (factory: Storage): Record<string, number> => {
    try {
        return (JSON.parse(factory.getItem(VersionKey)) as unknown) as Record<
            string,
            number
        >;
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
            return factory.getItem(key);
        });
        useEffect(() => {
            factory.setItem(key, value.value);
        });
        return value;
    };
};

export const useSessionState = createUseStorageState(sessionStorage);

export const useLocalState = createUseStorageState(localStorage);
