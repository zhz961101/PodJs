// https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
// import { effect } from './reactivity/reactivity'

const waiting = new WeakSet<any>();
const p = Promise && Promise.resolve();

declare global {
    interface Window {
        setImmediate: any;
    }
}

export const nextTick = (() => {
    let nxtCall;
    if (p) {
        nxtCall = (cb: () => any) => p.then(() => cb());
    } else {
        nxtCall = (cb: () => any) => (window.setImmediate || window.setTimeout)((_) => cb(), 0);
    }
    return (cb: () => any): Promise<any> => {
        if (waiting.has(cb)) {
            return;
        } else {
            waiting.add(cb);
        }
        return nxtCall(cb)
            .then(() => waiting.delete(cb));
    };
})();
