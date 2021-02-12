import { createContext, MetaComponent, MetaProps } from '@tacopie/taco';

interface QueryCacheUnit {
    expire: number;
    payload: any;
}

type QueryWatcher = (data: any) => void;

const queryKey = (args: any[]) => JSON.stringify([...args]);

class QueryCache {
    queryCacheMap = new Map<string, QueryCacheUnit>();

    queryWatcherMap = new Map<string, Set<QueryWatcher>>();

    CONCURRENT_PROMISES = new Map<string, Promise<any>>();

    has(args: any[]) {
        const key = queryKey(args);
        return this.queryCacheMap.has(key);
    }

    expired(args: any[]) {
        const key = queryKey(args);
        if (this.queryCacheMap.has(key)) {
            return this.queryCacheMap.get(key).expire < Date.now();
        }
        return true;
    }

    get(args: any[]): QueryCacheUnit | null {
        const key = queryKey(args);
        if (this.queryCacheMap.has(key)) {
            return this.queryCacheMap.get(key);
        }
        return null;
    }

    set(args: any[], payload: any, age = 0) {
        const key = queryKey(args);
        this.queryCacheMap.set(key, { payload, expire: Date.now() + age });

        this.queryWatcherMap.get(key)?.forEach(watcher => watcher(payload));
    }

    mutate(args: any, payload: any) {
        const key = queryKey(args);
        this.queryCacheMap.set(key, {
            payload,
            expire: this.get(args).expire || Date.now(),
        });

        this.queryWatcherMap.get(key)?.forEach(watcher => watcher(payload));
    }

    subscribe(args: any[], watcher: QueryWatcher) {
        const key = queryKey(args);
        if (!this.queryWatcherMap.has(key)) {
            this.queryWatcherMap.set(key, new Set());
        }
        const wset = this.queryWatcherMap.get(key);
        wset.add(watcher);
    }

    unsubscribe(args: any[], watcher: QueryWatcher) {
        const key = queryKey(args);
        if (!this.queryWatcherMap.has(key)) {
            this.queryWatcherMap.set(key, new Set());
        }
        const wset = this.queryWatcherMap.get(key);
        wset.delete(watcher);
    }

    // PROMISE
    hasP(args: any[]) {
        const key = queryKey(args);
        return this.CONCURRENT_PROMISES.has(key);
    }
    setP(args: any[], p: Promise<any>) {
        const key = queryKey(args);
        this.CONCURRENT_PROMISES.set(key, p);
    }
    getP(args: any[]): Promise<any> | null {
        const key = queryKey(args);
        return this.CONCURRENT_PROMISES.get(key) || null;
    }
    delP(args: any[]) {
        const key = queryKey(args);
        this.CONCURRENT_PROMISES.delete(key);
    }
}

export const queryCache = new QueryCache();

export const createQueryCacher = () => {
    const subQueryCacher = new QueryCache();
    const [Provider, useContext] = createContext(subQueryCacher);
    return [
        ((props: MetaProps) =>
            Provider({ ...props, value: subQueryCacher })) as MetaComponent,
        useContext,
    ] as const;
};
