let extend = (o, n) => {
    for (var p in n) {
        if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p)))
            o[p] = n[p];
    }
};
let JSvm = (code, sandbox) => {
    let rep_non_print = (text) => {
        return text.replace("\n", "\\n").replace("\t", "\\t").replace("\f", "\\f").replace("\v", "\\v").replace("\r", "\\r")
    }
    sandbox = sandbox || {};
    const fn = new Function('sandbox', `with(sandbox){${rep_non_print(code)}}`);
    const _proxy = new Proxy(sandbox, {
        has(target, key) {
            return true;
        }
    });
    return fn(_proxy);
};
let multiCode2Tuple = (code) => {
    return code.replace(/(^|;)return /g, "").replace(/(["'])(.+?)(;)(.+?)\1/g, "$1$2$3#$4$1").split(/;(?!#)/g).join(",").replace(";#", ";");
};

class VmError extends Error {
    constructor(message) {
        super();
        Error.captureStackTrace(this, this.constructor);
        this.message = message || 'Undefined error';
        this.name = 'VmError';
    }
}
let safeSandBox = {
    console: window.console,
    alert: msg => {
        window.alert(msg)
    },
    debugger: window.debugger,
    Error: VmError
};
let JSafeVm = (code, data) => {
    data = data || {};
    try {
        code = "return (" + multiCode2Tuple(code) + ")";
    } catch (e) {
        console.error(e)
    }
    data = Object.assign(data, safeSandBox);
    return JSvm(code, data);
};

module.exports = {
    safe: JSafeVm,
    vm: JSvm
};
