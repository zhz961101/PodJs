import { useEffect, useRef, useMemo, Mptr, unref } from '@tacopie/taco';

// https://github.com/streamich/ts-easing/blob/master/src/index.ts
// and https://easings.net/cn#

const { pow, sqrt, cos, sin, PI } = Math;
const easing = {
    // No easing, no acceleration
    linear: (t: number) => t,

    // Accelerates fast, then slows quickly towards end.
    quadratic: (t: number) => t * (-(t * t) * t + 4 * t * t - 6 * t + 4),

    // Overshoots over 1 and then returns to 1 towards end.
    cubic: (t: number) => t * (4 * t * t - 9 * t + 6),

    // Overshoots over 1 multiple times - wiggles around 1.
    elastic: (t: number) =>
        t * (33 * t * t * t * t - 106 * t * t * t + 126 * t * t - 67 * t + 15),

    // Accelerating from zero velocity
    inQuad: (t: number) => t * t,

    // Decelerating to zero velocity
    outQuad: (t: number) => t * (2 - t),

    // Acceleration until halfway, then deceleration
    inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

    // Accelerating from zero velocity
    inCubic: (t: number) => t * t * t,

    // Decelerating to zero velocity
    outCubic: (t: number) => --t * t * t + 1,

    // Acceleration until halfway, then deceleration
    inOutCubic: (t: number) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

    // Accelerating from zero velocity
    inQuart: (t: number) => t * t * t * t,

    // Decelerating to zero velocity
    outQuart: (t: number) => 1 - --t * t * t * t,

    // Acceleration until halfway, then deceleration
    inOutQuart: (t: number) =>
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

    // Accelerating from zero velocity
    inQuint: (t: number) => t * t * t * t * t,

    // Decelerating to zero velocity
    outQuint: (t: number) => 1 + --t * t * t * t * t,

    // Acceleration until halfway, then deceleration
    inOutQuint: (t: number) =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

    // Accelerating from zero velocity
    inSine: (t: number) => -cos(t * (PI / 2)) + 1,

    // Decelerating to zero velocity
    outSine: (t: number) => sin(t * (PI / 2)),

    // Accelerating until halfway, then decelerating
    inOutSine: (t: number) => -(cos(PI * t) - 1) / 2,

    // Exponential accelerating from zero velocity
    inExpo: (t: number) => pow(2, 10 * (t - 1)),

    // Exponential decelerating to zero velocity
    outExpo: (t: number) => -pow(2, -10 * t) + 1,

    // Exponential accelerating until halfway, then decelerating
    inOutExpo: (t: number) => {
        t /= 0.5;
        if (t < 1) return pow(2, 10 * (t - 1)) / 2;
        t--;
        return (-pow(2, -10 * t) + 2) / 2;
    },

    // Circular accelerating from zero velocity
    inCirc: (t: number) => -sqrt(1 - t * t) + 1,

    // Circular decelerating to zero velocity Moves VERY fast at the beginning and
    // then quickly slows down in the middle. This tween can actually be used
    // in continuous transitions where target value changes all the time,
    // because of the very quick start, it hides the jitter between target value changes.
    outCirc: (t: number) => sqrt(1 - (t - 1) * (t - 1)),

    // Circular acceleration until halfway, then deceleration
    inOutCirc: (t: number) => {
        t /= 0.5;
        if (t < 1) return -(sqrt(1 - t * t) - 1) / 2;
        t -= 2;
        return (sqrt(1 - t * t) + 1) / 2;
    },
};

type NumberPtr = Mptr<number>;

export function useAnimation(
    easingName = 'linear' as Mptr<keyof typeof easing>,
    duration = 500 as NumberPtr,
    delay = 0 as NumberPtr,
) {
    // The useAnimationTimer hook calls useState every animation frame ...
    // ... giving us elapsed time and causing a rerender as frequently ...
    // ... as possible for a smooth animation.
    const elapsed = useAnimationTimer(duration, delay);

    return useMemo(() => {
        // Amount of specified duration elapsed on a scale from 0 - 1
        const n = Math.min(1, unref(elapsed) / unref(duration));
        // Return altered value based on our specified easing function
        return (easing[unref(easingName)] || easing['linear'])(n);
    });
}

function useAnimationTimer(
    duration = 1000 as NumberPtr,
    delay = 0 as NumberPtr,
) {
    const elapsed = useRef(0);
    const setTime = (x: number) => (elapsed.value = x);

    useEffect(() => {
        let animationFrame: number, timerStop: any, start: number;

        // Function to be executed on each animation frame
        function onFrame() {
            setTime(Date.now() - start);
            loop();
        }

        // Call onFrame() on next animation frame
        function loop() {
            animationFrame = requestAnimationFrame(onFrame);
        }

        const durationVal = unref(duration);
        function onStart() {
            // Set a timeout to stop things when duration time elapses
            timerStop = setTimeout(() => {
                cancelAnimationFrame(animationFrame);
                setTime(Date.now() - start);
            }, durationVal);

            // Start the loop
            start = Date.now();
            loop();
        }

        const delayVal = unref(delay);
        // Start after specified delay (defaults to 0)
        const timerDelay = setTimeout(onStart, delayVal);

        // Clean things up
        return () => {
            clearTimeout(timerStop);
            clearTimeout(timerDelay);
            cancelAnimationFrame(animationFrame);
        };
    });

    return elapsed;
}
