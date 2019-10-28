// https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/

const waiting = new WeakSet<any>()

export const nxtTickRun = (() => {
    let nxtCall
    if (Promise && Promise.resolve)
        nxtCall = (cb, args) => Promise.resolve().then(_ => cb(...args))
    else
        nxtCall = (cb, args) => (window["setImmediate"] || window["setTimeout"])(_ => cb(...args), 0)
    return function (cb: Function, ctx: object = null, ...args): Promise<any> {
        if (waiting.has([cb, ctx]))
            return
        else
            waiting.add([cb, ctx])
        return nxtCall(cb.bind(ctx), args)
            .then(_ => waiting.delete([cb, ctx]))
    }
})()

