import { useCallback, useEffect, useRef } from '@tacopie/taco';
import { useCounter } from './useCounter';

enum AsyncStatus {
    IDLE = 'idle',
    PENDING = 'pending',
    SUCCESS = 'success',
    ERROR = 'error',
}

export function usePromise<T>(
    futureFactory: () => Promise<T>,
    immediate = true,
) {
    const value = useRef<T>();
    const err = useRef('');
    const status = useRef(AsyncStatus.IDLE);
    const [pendingCount, { inc, dec }] = useCounter();

    const execute = useCallback(() => {
        status.value = AsyncStatus.PENDING;
        value.value = null;
        err.value = null;

        inc();
        return futureFactory()
            .then(response => {
                status.value = AsyncStatus.SUCCESS;
                value.value = response;
            })
            .catch(error => {
                err.value = error;
                status.value = AsyncStatus.ERROR;
            })
            .finally(dec);
    });

    useEffect(() => {
        if (immediate) {
            execute();
        }
    });
    return [value, pendingCount, status, err];
}
