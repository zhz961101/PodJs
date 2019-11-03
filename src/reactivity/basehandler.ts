
import { getToRaw, reactive, track, trigger } from "./reactivity";

const isObject = (o: any): boolean => o === null ? false : typeof o === "object";
const hasOwn = (val: object, key: string): boolean => Object.prototype.hasOwnProperty.call(val, key);

export const baseHandler = (upper) => ({
    get(target, key) {
        const res = Reflect.get(target, key);
        track(target, key);
        return isObject(res) ? reactive(res, { target, key }) : res;
    },
    set(target, key, value, receiver) {
        const oldValue = target[key];
        const newValue = getToRaw(value);
        const hadKey = hasOwn(target, key);
        const res = Reflect.set(target, key, value, receiver);
        if (!hadKey) {
            // add OperationType
            if (!upper) { trigger(getToRaw(target), key); } else { trigger(getToRaw(upper.target), upper.key); }
        } else if (newValue !== oldValue) {
            // set OperationType
            if (!upper) { trigger(getToRaw(target), key); } else { trigger(getToRaw(upper.target), upper.key); }
        }
        return res;
    },
});
