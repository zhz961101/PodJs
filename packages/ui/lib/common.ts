const requiredFiles = new Set<string>();
export const mustRequire = (uri: string, isJS?: boolean, attrs?: object) => {
    if (requiredFiles.has(uri)) return;
    requiredFiles.add(uri);

    const isCss = typeof isJS === 'boolean' ? !isJS : /css$/gi.test(uri);
    const files = Array.from(
        document.getElementsByTagName(isCss ? 'link' : 'script'),
    );

    for (const file of files) {
        const path = file[isCss ? 'href' : 'src'];
        if (path.includes(uri)) {
            return;
        }
    }
    const elem = document.createElement(isCss ? 'link' : 'script');
    attrs && Object.entries(attrs).forEach(([k, v]) => elem.setAttribute(k, v));
    elem.setAttribute(isCss ? 'href' : 'src', uri);
    document.head.appendChild(elem);
};
export const once = <Ret>(func: () => Ret) => {
    let ran = false,
        memo: Ret;
    return function () {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
    };
};
