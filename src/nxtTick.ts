// https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
import { effect } from './reactivity/reactivity'

const waiting = new WeakSet<any>()
const p = Promise && Promise.resolve()

export const nextTick = (() => {
    let nxtCall
    if (p)
        nxtCall = (cb: Function, args: any[]) => p.then(_ => cb(...args))
    else
        nxtCall = (cb: Function, args: any[]) => (window["setImmediate"] || window["setTimeout"])(_ => cb(...args), 0)
    return function (cb: Function, ctx: object = null, ...args): Promise<any> {
        if (waiting.has([cb, ctx]))
            return
        else
            waiting.add([cb, ctx])
        return nxtCall(cb.bind(ctx), args)
            .then(() => waiting.delete([cb, ctx]))
    }
})()

export function nextTickEffect(cb: Function, ctx: object = null, ...args) {
    let fn = function () {
        // 👇 realtime call for track deps
        cb.call(ctx, ...args)
        // 👇 async call
        fn = () => nextTick(cb, ctx, ...args)
    }
    effect(fn)
}
