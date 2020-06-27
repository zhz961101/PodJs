import { uniqKey } from '../common';

const aniTimeout = (cb, interval) => {
    const stime = performance.now();
    let etime = stime;
    let timeoutTimer = null;
    const loop = () => {
        timeoutTimer = requestAnimationFrame(loop);
        etime = performance.now();
        if (etime - stime >= interval) {
            cb();
            cancelAnimationFrame(timeoutTimer);
        }
    };
    return requestAnimationFrame(loop);
};
const clearAniTimeout = cancelAnimationFrame;

interface AnimationOption {
    duration?: number;
    delay?: number;
    ease?: string;
    [key: string]: string | number;
}

const cssTimer = (val: number | string) => (!isNaN(val as number) ? `${val}ms` : val);

const cssConverter = {
    x(val: string) {
        return { transform: ` translateX(${val}) ` };
    },
    y(val: string) {
        return { transform: ` translateY(${val}) ` };
    },
    duration(val: string) {
        return { 'transition-duration': cssTimer(val) };
    },
    delay(val: string) {
        return { 'transition-delay': cssTimer(val) };
    },
    ease(val: string) {
        return { 'transition-timing-function': cssTimer(val) };
    },
};

const cssTextFromObj = css => {
    let text = '';
    for (const key in css) {
        if (css.hasOwnProperty(key)) {
            const val = css[key];
            text += `${key}:${val} !important;`;
        }
    }
    return text;
};

const cssTextByAnimation = (aniOpt: AnimationOption, className: string) => {
    const css = Object.keys(aniOpt)
        .filter(key => ['duration', 'delay', 'ease'].indexOf(key) === -1)
        .reduce((all: any, key) => {
            let cssOpt: any = {};
            if (key in cssConverter) {
                cssOpt = cssConverter[key](aniOpt[key]);
            } else {
                cssOpt = { [key]: aniOpt[key] };
            }
            if (cssOpt.transform) {
                cssOpt.transform = (all.transform || '') + ' ' + cssOpt.transform;
            }
            return { ...all, ...cssOpt };
        }, {});
    const properties = Object.keys(css);

    const duration = `transition-duration: ${Math.max(aniOpt.duration || 1, 50)}ms !important;`;
    const delay = aniOpt.delay ? `transition-delay: ${aniOpt.delay}ms !important;` : '';
    const ease = aniOpt.ease ? `transition-timing-function: ${aniOpt.ease} !important;` : '';
    const property = properties.length
        ? `transition-property: ${properties.join(',')} !important;`
        : '';

    return `.${className}{${duration}${delay}${ease}${property}${cssTextFromObj(css)}}`;
};

const styleClsMap: Map<string, string> = new Map<string, string>();

const styleToCls = (style: AnimationOption): [string, boolean] => {
    const text = JSON.stringify(style);
    if (styleClsMap.has(text)) {
        return [styleClsMap.get(text), true];
    }
    const cls = 'motion_' + uniqKey();
    styleClsMap.set(text, cls);
    return [cls, false];
};

export const useMotion = (animLs: AnimationOption[]) => {
    const classNames = animLs.map((style, idx) => styleToCls(style));

    for (const cls of classNames) {
        const [_, dupe] = cls;
        if (!dupe) {
            const styleNode = document.createElement('style');
            styleNode.type = 'text/css';

            styleNode.innerHTML = animLs
                .map((opt, idx) => cssTextByAnimation(opt, classNames[idx][0]))
                .join('');
            document.head.appendChild(styleNode);
        }
    }

    let ref: HTMLElement | null = null;
    let timer = null;

    function stop() {
        clearAniTimeout(timer);
        classNames.forEach(([className]) => ref && ref.classList.remove(className));
    }

    return {
        motionRef(elem) {
            ref = elem;
        },
        start() {
            if (!animLs || animLs.length === 0) {
                return;
            }
            stop();
            nxtMotion(0);

            function nxtMotion(idx: number) {
                if (!ref) {
                    return;
                }
                if (idx === animLs.length) {
                    stop();
                    return;
                }

                const [className] = classNames[idx];
                const { duration = 1, delay = 1 } = animLs[idx];
                ref.classList.add(className);

                timer = aniTimeout(() => {
                    ref.classList.remove(className);
                    nxtMotion(idx + 1);
                }, Math.max(50, duration + delay));
            }
        },
        stop,
    };
};
