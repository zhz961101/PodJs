import { useRef } from '@tacopie/taco';

interface MutationOptions<
    Params extends Record<string, any> = {},
    Resp = any,
    Rollback = any
> {
    retryCount?: number;
    onSettled?: (resp?: Resp, err?: Error) => void;
    onError?: (err: Error, rollback?: Rollback) => void;
    onSuccess?: (resp: Resp) => void;
    onMutateBefore?: (params: Params) => void | Promise<Rollback>;
}

const defaultOptions: MutationOptions = {
    retryCount: 3,
};

enum MutationState {
    Idle = 'idle',
    Loading = 'loading',
    Success = 'success',
    Error = 'error',
}

export const useMutation = <
    Params extends Record<string, any>,
    Resp = any,
    Rollback = any
>(
    mutationFn: (params: Params) => Promise<Resp>,
    options = defaultOptions as MutationOptions<Params, Resp, Rollback>,
) => {
    options = { ...defaultOptions, ...options };
    const data = useRef<Resp | null>(null);
    const error = useRef<Error | null>(null);
    const state = useRef(MutationState.Idle);

    return { data, error, state, mutate };

    async function mutate(params: Params) {
        state.value = MutationState.Loading;
        let rollback: Rollback | void;
        if (options.onMutateBefore) {
            rollback = await options.onMutateBefore(params);
        }
        try {
            data.value = await mutationFn(params);
            state.value = MutationState.Success;
            if (options.onSuccess) {
                options.onSuccess(data.value);
            }
            if (options.onSettled) {
                options.onSettled(data.value);
            }
        } catch (err) {
            error.value = err;
            state.value = MutationState.Error;
            if (options.onError) {
                options.onError(err, rollback || undefined);
            }
            if (options.onSettled) {
                options.onSettled(undefined, err);
            }
        }
    }
};
