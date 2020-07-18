import { ref, Ref, effect } from '@vue/reactivity';
import { useState } from './useState';

export function useValue<T>(initial: () => T): Ref<T> {
    const [, , value] = useState();
    effect(() => (value.value = initial()));
    return value as Ref<T>;
}
