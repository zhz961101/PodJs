import { useRef, Mptr, useWatch, unref } from '@tacopie/taco';

const resizeArr = (idx: number, arr: Array<any>) =>
    arr.length < idx ? (arr.length = idx + 1) : void 0;

const titleStack = [] as string[];
const getTitle = (idx: number) =>
    idx === -1
        ? 'Document'
        : !titleStack[idx]
        ? getTitle(idx - 1)
        : titleStack[idx];
export const useTitle = (title: Mptr<string>) => {
    const idx = useRef(titleStack.length);
    useWatch(
        () => unref(title),
        nextTitle => {
            resizeArr(unref(idx), titleStack);
            titleStack[unref(idx)] = nextTitle;
            document.title = nextTitle;
            return () => {
                titleStack[unref(idx)] = null;
                document.title = getTitle(unref(idx));
            };
        },
    );
};
