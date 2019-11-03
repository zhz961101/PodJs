
export const mergeReact = (...objects: object[]) => {
    if (objects.length === 0) { return; }
    if (objects.length === 1) { return objects[0]; }
    const extra = objects.slice(1);

    return new Proxy(objects[0], {
        has(target, key) {
            for (const o of objects) {
                if (Reflect.has(o, key)) { return true; }
            }
            return false;
        },
        get(target, key, receiver) {
            if (Reflect.has(target, key)) {
                return Reflect.get(target, key, receiver);
            }
            return (extra.find((o) => Reflect.has(o, key)) || {})[key];
        },
        // set(target, key, val, receiver) {
        //     const obj = extra.find(o => Reflect.has(o, key))
        //     if (obj) {
        //         return Reflect.set(obj, key, val, receiver)
        //     }
        //     return Reflect.set(target, key, val, receiver)
        // }
    });
};

export function readOnlyReact(obj: object) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            return Reflect.get(target, key, receiver);
        },
        set(target, key) {
            return false;
        },
    });
}
