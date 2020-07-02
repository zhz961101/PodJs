// import flatten from "lodash/flatten";

////////////////////
const __DEV__ = true;
///////////////////

import isEqual from 'lodash/isEqual';
import { VNode } from './types';

const isFunc = f => typeof f === 'function';

const NewPatcher = (
    type: PatcherType,
    prev: VNode,
    next: VNode,
    leftAnchor?: VNode,
    rightAnchor?: VNode,
) => ({ type, prev, next, leftAnchor, rightAnchor });
export type Patcher = ReturnType<typeof NewPatcher>;

export enum PatcherType {
    MOUNT,
    UNMOUNT,
    MOVE,
    CONTENT_CHANGE,
}

const sameVNode = (a: VNode, b: VNode) =>
    a.type === b.type &&
    a.content === b.content &&
    a.props?.key === b.props?.key &&
    (isFunc(a.type) ? isEqual(a.props, b.props) : true);

export const diff = (prev: VNode, next: VNode) => {
    return diffVNodeArray([prev], [next]);
};

// const diffVnode = (prev: VNode, next: VNode): Patcher[] => {
//     if (!sameVNode(prev, next)) {
//         if (prev.content !== next.content) {
//             return [NewPatcher(PatcherType.CONTENT_CHANGE, prev, next)]
//         }
//         return [NewPatcher(PatcherType.MOUNT, prev, next, prev), NewPatcher(PatcherType.UNMOUNT, prev, next, prev)];
//     } else {
//         next.real_dom = prev.real_dom;
//     }
//     return []
// }

const diffVnode = (prev: VNode, next: VNode): Patcher[] => {
    const ret = [] as Patcher[];
    if (!sameVNode(prev, next)) {
        if (prev.content !== next.content) {
            ret.push(...[NewPatcher(PatcherType.CONTENT_CHANGE, prev, next)]);
        } else {
            ret.push(
                ...[
                    NewPatcher(PatcherType.MOUNT, prev, next, prev),
                    NewPatcher(PatcherType.UNMOUNT, prev, null),
                ],
            );
        }
    } else {
        next.real_dom = prev.real_dom;
        ret.push(...diffVNodeArray(prev.children, next.children));
    }
    return ret;
};

// fragment diff
export const diffVNodeArray = (prev: VNode[], next: VNode[]): Patcher[] => {
    prev = prev.filter(Boolean);
    next = next.filter(Boolean);

    const PrevLength = prev.length;
    const NextLength = next.length;

    switch (PrevLength) {
        case 0: {
            switch (NextLength) {
                case 0: {
                    return [];
                    break;
                }
                case 1: {
                    return [NewPatcher(PatcherType.MOUNT, null, next[0])];
                    break;
                }
                default: {
                    // next all mount
                    return Array.from({ length: NextLength })
                        .fill(null)
                        .map((_, idx) =>
                            NewPatcher(PatcherType.MOUNT, null, next[idx]),
                        );
                    break;
                }
            }
            break;
        }
        case 1: {
            switch (NextLength) {
                case 0: {
                    return [NewPatcher(PatcherType.UNMOUNT, prev[0], null)];
                    break;
                }
                case 1: {
                    return diffVnode(prev[0], next[0]);
                    break;
                }
                default: {
                    // next all mount
                    const ret = Array.from({ length: NextLength })
                        .fill(null)
                        .map((_, idx) =>
                            NewPatcher(PatcherType.MOUNT, null, next[idx]),
                        );

                    const idx = next.findIndex(n => sameVNode(n, prev[0]));
                    if (idx !== -1) {
                        // 有相似的就不mount
                        ret[idx] = null;
                        const patches = diffVnode(prev[0], next[idx]);
                        ret.push(...patches);
                    }
                    return ret.filter(Boolean);
                    break;
                }
            }
            break;
        }
        default: {
            switch (NextLength) {
                case 0: {
                    // prev all unmount
                    return Array.from({ length: PrevLength })
                        .fill(null)
                        .map((_, idx) =>
                            NewPatcher(PatcherType.UNMOUNT, prev[idx], null),
                        );
                    break;
                }
                case 1: {
                    // prev all unmount
                    const ret = Array.from({ length: PrevLength })
                        .fill(null)
                        .map((_, idx) =>
                            NewPatcher(PatcherType.UNMOUNT, prev[idx], null),
                        );

                    const idx = prev.findIndex(n => sameVNode(n, prev[0]));
                    if (idx !== -1) {
                        // 有相似的就不unmount
                        ret[idx] = null;
                        const patches = diffVnode(prev[idx], next[0]);
                        ret.push(...patches);
                    }
                    return ret.filter(Boolean);
                    break;
                }
                default: {
                    return diffLongVNodeArray(prev, next);
                    break;
                }
            }
            break;
        }
    }
};

/**
 * 这里是diff的核心
 *
 * vue3里左右对比的操作被去除了，只做基本的 左左 右右 指针对比
 * 然后直接对比乱序内容
 */

const diffLongVNodeArray = (prevChildren: VNode[], nextChildren: VNode[]) => {
    const ret = [] as Patcher[];

    const nextChildrenLength = nextChildren.length;
    const prevChildrenLength = prevChildren.length;

    // let prevLeftIdx = 0;
    // let nextLeftIdx = 0;
    let prevRightIdx = prevChildren.length - 1;
    let nextRightIdx = nextChildren.length - 1;

    let i = 0;
    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= prevRightIdx && i <= nextRightIdx) {
        const prevNode = prevChildren[i];
        const nextNode = nextChildren[i];
        if (sameVNode(prevNode, nextNode)) {
            ret.push(...diffVnode(prevNode, nextNode));
        } else {
            break;
        }
        i++;
    }

    // 2. sync from end
    // a (b c)
    // d e (b c)
    while (i <= prevRightIdx && i <= nextRightIdx) {
        const prevNode = prevChildren[prevRightIdx];
        const nextNode = nextChildren[nextRightIdx];
        if (sameVNode(prevNode, nextNode)) {
            ret.push(...diffVnode(prevNode, nextNode));
        } else {
            break;
        }
        prevRightIdx--;
        nextRightIdx--;
    }

    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, prevRightIdx = 1, nextRightIdx = 2
    // (a b)
    // c (a b)
    // i = 0, prevRightIdx = -1, nextRightIdx = 0
    if (i > prevRightIdx) {
        if (i <= nextRightIdx) {
            const nextPos = nextRightIdx + 1;
            while (i <= nextRightIdx) {
                ret.push(
                    NewPatcher(
                        PatcherType.MOUNT,
                        null,
                        nextChildren[nextRightIdx],
                        // 说实话这里逻辑是有点诡异....
                        // 但是确实是对的
                        prevRightIdx !== -1 ? prevChildren[prevRightIdx] : null,
                        prevRightIdx === -1 ? prevChildren[0] : null,
                    ),
                );
                i++;
            }
        }
    } else if (i > nextRightIdx) {
        while (i <= prevRightIdx) {
            ret.push(NewPatcher(PatcherType.UNMOUNT, prevChildren[i], null));
            i++;
        }
    } else {
        const prevLeftIdx = i; // prev starting index
        const nextLeftIdx = i; // next starting index

        const keyToNewIndexMap: Map<string | number, number> = new Map();

        ///////////////////////////
        ////////  TODO  ///////////
        ///////////////////////////

        const unmounts = Array.from({ length: prevRightIdx - i + 1 })
            .fill(null)
            .map((_, idx) => {
                return NewPatcher(
                    PatcherType.UNMOUNT,
                    prevChildren[i + idx],
                    null,
                );
            });
        const mounts = Array.from({ length: nextRightIdx - i + 1 })
            .fill(null)
            .map((_, idx) => {
                return NewPatcher(
                    PatcherType.MOUNT,
                    prevChildren[i],
                    nextChildren[i + idx],
                );
            });
        ret.push(...unmounts);
        ret.push(...mounts);
    }

    return ret;
};
