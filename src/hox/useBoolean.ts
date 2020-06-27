import { useState } from "./useState";

export const useBoolean = (init = false) => {
    const [getter, setter, state] = useState(init);
    const toggle = () => setter(!getter());
    const setTrue = () => setter(true);
    const setFalse = () => setter(false);
    return {
        getter,
        setter,
        state,
        toggle,
        setTrue,
        setFalse,
    };
};
