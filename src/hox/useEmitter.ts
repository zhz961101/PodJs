import { useEffect } from '../core/useEffect';
import { useState } from '../core/useState';

const noop = (...x: any[]) => '';

export const useEmitter = () => {
    const [getter, setter, emitterCount] = useState(0);
    return {
        count: emitterCount,
        emit() {
            emitterCount.value += 1;
        },
        effect(fn: () => {}) {
            useEffect(() => {
                noop(emitterCount.value);
                fn();
            });
        },
    };
};
