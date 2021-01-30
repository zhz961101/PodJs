import { useCallback, useEffect, useState } from '@tacopie/taco';
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
    const [, setValue, value] = useState<T>();
    const [, setErr, err] = useState('');
    const [, setStatus, status] = useState(AsyncStatus.IDLE);
    const [pendingCount, { inc, dec }] = useCounter();

    const execute = useCallback(() => {
        setStatus(AsyncStatus.PENDING);
        setValue(null);
        setErr(null);

        inc();
        return futureFactory()
            .then(response => {
                setStatus(AsyncStatus.SUCCESS);
                setValue(response);
            })
            .catch(err => {
                setErr(err);
                setStatus(AsyncStatus.ERROR);
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
