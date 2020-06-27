let loadingCircleAnimation: HTMLElement = null;

function regLoadingAnimation() {
    if (loadingCircleAnimation) {
        return;
    }
    const styleNode = document.createElement('style');
    styleNode.innerHTML = '@keyframes loadingCircle {100% { transform: rotate(360deg) }}';
    document.head.appendChild(styleNode);
    loadingCircleAnimation = styleNode;
}

export const Loading = () => {
    return;
};

const LoadIcon = () => {
    regLoadingAnimation();
};

Loading.Icon = LoadIcon;
