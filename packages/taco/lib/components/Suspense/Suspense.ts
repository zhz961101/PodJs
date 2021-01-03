import { MetaAsyncGeneratorComponent } from '../../types';
import { useCatcher, useChannel, useErrThrower, useInstance } from '../../hook';
import { Component, h } from '../../core';

interface SuspenseProps {
    firstPaintMS: number;
    fallback: ReturnType<typeof h>;
}

class PayloadError<Payload> extends Error {
    payload: Payload;
    constructor(payload: Payload) {
        super('PayloadError');
        this.payload = payload;

        Object.setPrototypeOf(this, PayloadError.prototype);
    }
}
class SuspenseSignal extends PayloadError<Promise<any>> {}

export const useSuspenseAdapter = () => {
    const ins = useInstance();
    const errThrowner = useErrThrower();
    return function SuspenseAdapter(promise: Promise<any>) {
        errThrowner(new SuspenseSignal(promise), ins);
    };
};
const useSuspense = () => {
    const [chan, CONTINUE] = useChannel();
    const thrower = useErrThrower();
    useCatcher(async (signal: Error, source: Component) => {
        if (signal instanceof SuspenseSignal) {
            await signal.payload;
            CONTINUE();
            return;
        }
        thrower(signal, source);
    });
    return chan;
};

export const Suspense: MetaAsyncGeneratorComponent<SuspenseProps> = async function* (
    props,
) {
    const chan = useSuspense();
    yield props.fallback;
    await chan;
    return props.children;
};
