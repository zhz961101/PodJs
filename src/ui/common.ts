export const excludeKeysObj = (obj: object, keys: string[]) => {
    const ret = {};
    Object.keys(obj)
        .filter(key => !keys.includes(key))
        .forEach(key => (ret[key] = obj[key]));
    return ret;
};

export const includeKeysObj = (obj: object, keys: string[]) =>
    excludeKeysObj(
        obj,
        Object.keys(obj).filter(key => !keys.includes(key)),
    );

function isUnDef(obj: any): boolean {
    return obj === undefined || obj === null;
}

export function isUnDefAll(arr: any, ...arg: any[]): boolean {
    if (!Array.isArray(arr)) {
        arr = [arr];
    }
    if (Array.isArray(arg)) {
        arr = arr.concat(arg);
    }
    return arr.length ? arr.reduce((r, o) => r && isUnDef(o), true) : false;
}

const IncludedCache = new Map<string, boolean>();

export const isIncluded = (name: string) => {
    if (IncludedCache.has(name)) {
        return true;
    }
    const js = /js$/i.test(name);
    const es = Array.from(document.getElementsByTagName(js ? 'script' : 'link'));
    for (const node of es) {
        if (node[js ? 'src' : 'href'].indexOf(name) !== -1) {
            IncludedCache.set(name, true);
            return true;
        }
    }
    return false;
};
