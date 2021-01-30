import { useEffect, useRef, useMemo, Mptr, unref } from '@tacopie/taco';

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
        const n = Math.min(1, elapsed.value / unref(duration));
        // Return altered value based on our specified easing function
        return (easing[unref(easingName)] || easing['linear'])(n);
    });
}

// Some easing functions copied from:
// https://github.com/streamich/ts-easing/blob/master/src/index.ts
// Hardcode here or pull in a dependency
const easing = {
    linear: (n: number) => n,
    elastic: (n: number) =>
        n * (33 * n * n * n * n - 106 * n * n * n + 126 * n * n - 67 * n + 15),
    inExpo: (n: number) => Math.pow(2, 10 * (n - 1)),
};

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
