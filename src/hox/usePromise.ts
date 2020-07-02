import { useEffect } from './useEffect';
import { useState } from './useState';

export function usePromise<T>(futureFactory: () => Promise<T>) {
    const [, setter, value] = useState<T>();
    const [, ErrSetter, err] = useState('');
    const [, loadingSetter, loading] = useState(true);
    useEffect(() => {
        loadingSetter(true);
        futureFactory()
            .then(setter)
            .then(() => loadingSetter(false))
            .catch(ErrSetter);
    });
    return { value, loading, err };
}
