// https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
// import { effect } from './reactivity/reactivity'

const waiting = new WeakSet<any>()
const p = Promise && Promise.resolve()

export const nextTick = (() => {
    let nxtCall
    if (p)
        nxtCall = (cb: Function) => p.then(() => cb())
    else
        nxtCall = (cb: Function) => (window["setImmediate"] || window["setTimeout"])(_ => cb(), 0)
    return function (cb: Function): Promise<any> {
        if (waiting.has(cb))
            return
        else
            waiting.add(cb)
        return nxtCall(cb)
            .then(() => waiting.delete(cb))
    }
})()
