import {
    Mptr,
    unref,
    useEffect,
    useMemo,
    useRef,
    useUnmount,
    useWatch,
} from '@tacopie/taco';
import { useEventListener } from '../useEventListener';
import { once } from '../common';
import { queryCache } from './queryCache';

const setFrameInterval = (
    cb: (...args: any[]) => any,
    interval: number,
    caller = requestIdleCallback as
        | typeof requestAnimationFrame
        | typeof requestIdleCallback,
) => {
    const now = Date.now;
    let stime = now();
    let etime = stime;
    let intervalTimer = null;
    const loop = () => {
        intervalTimer = caller(loop);
        etime = now();
        if (etime - stime >= interval) {
            stime = now();
            etime = stime;
            cb();
        }
    };
    intervalTimer = caller(loop);
    return intervalTimer;
};

// UTILS 👆

type RequestFetcher<Data, Args extends Array<any>> = (
    ...args: Args
) => Promise<Data>;

interface RequestOptions {
    staleMS?: number;
    cacheMS?: number;
    dedupe?: boolean;
    retryCount?: number;
    retryDelay?: number;
    immediate?: boolean;
    refetchOnHidden?: boolean;
    refetchOnFocus?: boolean;
    refetchOnOnline?: boolean;
}
const defaultOptions: RequestOptions = {
    staleMS: -1,
    cacheMS: 1000 * 60 * 3,
    dedupe: true,
    retryCount: 3,
    retryDelay: 1000,
    immediate: true,
    refetchOnHidden: false,
    refetchOnFocus: true,
    refetchOnOnline: true,
};

let windowFocus = true;
const listenWindowFocus = once(() => {
    window.addEventListener('focus', () => (windowFocus = true));
    window.addEventListener('blur', () => (windowFocus = false));
});

export const useQuery = <Args extends Array<any>, Data = Response>(
    hash: string,
    fetchArgs: string | Args | Mptr<string | Args> | (() => string | Args),
    fetcher: RequestFetcher<Data, Args> = (fetch as unknown) as RequestFetcher<
        Data,
        Args
    >,
    options = defaultOptions,
) => {
    listenWindowFocus(); // once function;

    options = { ...defaultOptions, ...options };
    if (!fetcher) {
        fetcher = (fetch as unknown) as RequestFetcher<Data, Args>;
    }
    const data = useRef(null as null | Data);
    const error = useRef(null as null | Error);
    const isLoading = useRef<boolean>(false);

    const retryCount = useRef(options.retryCount || 0);

    const unmountCallbacks = useRef([] as ((...args: any[]) => any)[]);
    useUnmount(() => unmountCallbacks.value.forEach(cb => cb()));

    const currentArgs = useMemo<Args | null>(() => {
        try {
            let args: string | Args;
            if (typeof fetchArgs === 'function') {
                args = fetchArgs();
            }
            args = unref(fetchArgs) as string | Args;
            return Array.isArray(args) ? args : ([args] as Args);
        } catch (err) {
            error.value = err;
            return null;
        }
    });

    // 因为usecallback会自动收集依赖...所以用ref
    const mutate = useRef(() => (newData: Data) => {
        if (newData === null) {
            return;
        }
        if (newData === data.value) {
            return;
        }
        data.value = newData;
        error.value = null;
    });

    const refetch = useRef(() => async () => {
        if (currentArgs.value === null) {
            return;
        }
        error.value = null;
        const cacheArgs = [hash, ...currentArgs.value];

        queryCache.subscribe(cacheArgs, mutate.value);

        if (options.cacheMS > 0 && queryCache.has(cacheArgs)) {
            if (!queryCache.expired(cacheArgs)) {
                data.value = queryCache.get(cacheArgs).payload;
                return;
            }
        }
        if (!options.refetchOnHidden && !windowFocus) {
            if (queryCache.has(cacheArgs)) {
                data.value = queryCache.get(cacheArgs).payload;
            }
            return;
        }
        isLoading.value = true;
        try {
            if (options.dedupe && queryCache.hasP(cacheArgs)) {
                data.value = await queryCache.getP(cacheArgs);
                return;
            }
            const p = fetcher(...currentArgs.value);
            queryCache.setP(cacheArgs, p);
            const newData = await p;
            data.value = newData;
            queryCache.set(cacheArgs, { timestamp: Date.now(), data: newData });
        } catch (err) {
            error.value = err;
            if (options.retryCount) {
                if (retryCount.value > 0) {
                    retryCount.value -= 1;
                    setTimeout(() => refetch.value(), options.retryDelay || 1);
                }
            }
        } finally {
            isLoading.value = false;
            queryCache.delP(cacheArgs);
        }
    });

    const immediated = useRef(false);
    useWatch(currentArgs, () => {
        if (!immediated && !options.immediate) {
            return;
        }
        immediated.value = true;
        refetch.value();
    });

    useEffect(() => {
        if (options.staleMS > 0) {
            const timer = setFrameInterval(
                () => refetch.value(),
                options.staleMS,
                options.refetchOnHidden
                    ? requestAnimationFrame
                    : requestIdleCallback,
            );
            return () =>
                options.refetchOnHidden
                    ? cancelAnimationFrame(timer)
                    : cancelIdleCallback(timer);
        }
    });
    useEventListener('focus', () => {
        options.refetchOnFocus && refetch.value();
    });
    useEventListener(
        'online',
        () => options.refetchOnOnline && refetch.value(),
    );

    return {
        data,
        error,
        isLoading,
        refetch: () => refetch.value(),
        mutate: (val: Data) => {
            mutate.value(val);
            queryCache.mutate([hash, ...currentArgs.value], val);
        },
    };
};
