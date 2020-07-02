import { useEffect } from './useEffect';
import { useState } from './useState';
import { Ref } from '@vue/reactivity';

interface StateMachineOptions {
    initial: string;
    [key: string]:
        | {
              value: any;
              [key: string]: string;
          }
        | string;
}

export const useStateMachine = (opt: StateMachineOptions) => {
    const { initial, ...other } = opt;
    const [, , current] = useState({ state: initial, value: null });

    const canGo = {};
    const stateVale = {};
    const actions = {} as { [key: string]: () => void };

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
                    actions[actionName] = () =>
                        (current.value.state = gotoTranstionName);
                }
            }
        }
    }

    const [, , transition] = useState({ ...actions });

    useEffect(() => {
        for (const stateName in canGo) {
            if (canGo.hasOwnProperty(stateName)) {
                const nextState = canGo[stateName];
                transition.value[
                    `to${stateName.slice(0, 1).toUpperCase()}${stateName.slice(
                        1,
                    )}`
                ] = nextState.includes(current.value.state)
                    ? () => (current.value.state = stateName)
                    : null;
            }
        }
        current.value = stateVale[current.value.state];
    });

    return [current, transition] as const;
};
