import { effect, ref, Ref } from "@vue/reactivity";
import { useState } from "../core/useState";

export function useValue<T>(initial: () => T): Ref<T> {
    const [, , value] = useState();
    effect(() => (value.value = initial()));
    return value as Ref<T>;
}
