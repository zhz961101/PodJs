import { ref, Ref } from '@vue/reactivity';
import { useEffect } from './useEffect';
import { useState } from './useState';

export function useValue<T>(initial: () => T): Ref<T> {
    const [, , value] = useState();
    useEffect(() => (value.value = initial()));
    return value as Ref<T>;
}
