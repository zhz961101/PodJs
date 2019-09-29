module.exports = {
    throttle(func, wait) {
        let timeout;
        return function () {
            let context = this;
            let args = arguments;
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null;
                    func.apply(context, args)
                }, wait)
            }
        }
    },
    rebuild(obj, exclude) {
        exclude = exclude || [];
        exclude.push("constructor", "__proto__")
        let ret = Object.create(null);
        for (const key in obj) {
            if (exclude.indexOf(key) != -1) continue;
            const value = obj[key];
            ret[key] = value
        }
        let proto = Object.getPrototypeOf(obj);
        Object.getOwnPropertyNames(proto).forEach(key => {
            if (exclude.indexOf(key) != -1) return;
            const value = obj[key];
            ret[key] = value
        })
        return ret;
    },
    isString(str) {
        return (typeof str == 'string') && str.constructor == String;
    },
    tpof(o) {
        return Object.prototype.toString.call(o);
    },
    mergeFunc(fa, fb) {
        return function (...args) {
            let ret;
            fa && (ret = fa.call(this, ...args));
            fb && (ret = fb.call(this, ...args));
            return ret;
        }
    },
    get(url) {
        return new Promise(resolve => {
            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    resolve(xhr.responseText)
                }
            }
            xhr.open("GET", url, true);
            xhr.send(null);
        })
    }
}