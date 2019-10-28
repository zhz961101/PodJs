
import { track, reactive, trigger, getToRaw } from './reactivity';

const isObject = (o: any): boolean => o === null ? false : typeof o === "object"
const hasOwn = (val: object, key: string): boolean => Object.prototype.hasOwnProperty.call(val, key)

export const baseHandler = {
    get(target, key) {
        const res = Reflect.get(target, key)
        track(target, key)
        return isObject(res) ? reactive(res) : res
    },
    set(target, key, value, receiver) {
        const oldValue = target[key],
            newValue = getToRaw(value),
            hadKey = hasOwn(target, key)
        const res = Reflect.set(target, key, value, receiver)
        if (!hadKey) {
            // add OperationType
            trigger(getToRaw(target), key)
        } else if (newValue !== oldValue) {
            // set OperationType
            trigger(getToRaw(target), key)
        }
        return res
    }
}

