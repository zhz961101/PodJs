import { useEffect } from './useEffect';
import { reactive } from '@vue/reactivity';

interface StateMachineOptions {
    initial: string;
    [key: string]:
    | {
        value: any;
        [key: string]: string;
    }
    | string;
}

export const useStateMachine = (
    opt: StateMachineOptions,
): [{ state: string; value: string }, { [key: string]: () => void }] => {
    const { initial, ...other } = opt;
    const current = reactive({ state: initial, value: null });

    const canGo = {};
    const stateVale = {};
    const actions = {};

    for (const stateName in other) {
        if (other.hasOwnProperty(stateName)) {
            const transiton = other[stateName];
            if (typeof transiton === 'string') {
                continue;
            }
            const { value, ...otherActions } = transiton;
            canGo[stateName] = Object.values(otherActions);
            stateVale[stateName] = value;
            for (const actionName in otherActions) {
                if (otherActions.hasOwnProperty(actionName)) {
                    const gotoTranstionName = otherActions[actionName];
                    actions[actionName] = () => (current.state = gotoTranstionName);
                }
            }
        }
    }

    const transition = reactive({ ...actions });

    useEffect(() => {
        for (const stateName in canGo) {
            if (canGo.hasOwnProperty(stateName)) {
                const nextState = canGo[stateName];
                transition[
                    `to${stateName.slice(0, 1).toUpperCase()}${stateName.slice(1)}`
                ] = nextState.includes(current.state) ? () => (current.state = stateName) : null;
            }
        }
        current.value = stateVale[current.state];
    });

    return [current, transition];
};
