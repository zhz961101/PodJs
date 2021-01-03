import { useState } from "../core/useState";

let fullScreen = (element: HTMLElement) => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
        fullScreen = (e: HTMLElement) => e.requestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
        fullScreen = (e: HTMLElement) => (e as any).msRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
        fullScreen = (e: HTMLElement) => (e as any).mozRequestFullScreen();
    } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
        fullScreen = (e: HTMLElement) => (e as any).webkitRequestFullscreen();
    }
};

let exitFullscreen = () => {
    exitFullscreen =
        (document as any).exitFullscreen ||
        (document as any).msExitFullscreen ||
        (document as any).mozExitFullscreen ||
        (document as any).webkitExitFullscreen;
    exitFullscreen();
};

let isFullscreen = () => {
    if ((document as any).isFullScreen) {
        isFullscreen = () => (document as any).isFullscreen;
    }
    if ((document as any).webkitIsFullscreen) {
        isFullscreen = () => (document as any).webkitFullscreen;
    }
    if ((document as any).mozIzFullScreen) {
        isFullscreen = () => (document as any).mozIzFullScreen;
    }
    return isFullscreen();
};

export const useFullScreen = () => {
    let element: HTMLElement = null;
    const [getter, setter, isFullscreenState] = useState(false);
    function setFull() {
        if (isFullscreenState.value) {
            return;
        }
        fullScreen(element || ((document as any) as HTMLElement));
        isFullscreenState.value = true;
    }
    function exitFull() {
        if (!isFullscreenState.value) {
            return;
        }
        exitFullscreen();
        isFullscreenState.value = false;
    }
    function toggleFull() {
        if (isFullscreen()) {
            exitFull();
        } else {
            setFull();
        }
    }
    return {
        ref(elem) {
            element = elem;
        },
        isFullscreen: isFullscreenState,
        setFull,
        exitFull,
        toggleFull,
    };
};
