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
let JSafeVmWithBlackList = (code, sandbox, mixBlack) => {
    let blacklist = ["eval", "Function"]
    mixBlack = mixBlack ? mixBlack.push.apply(mixBlack, blacklist) : blacklist
    let rep_non_print = (text) => {
        return text.replace("\n", "\\n").replace("\t", "\\t").replace("\f", "\\f").replace("\v", "\\v").replace("\r", "\\r")
    }
    sandbox = sandbox || {};
    const fn = new Function('sandbox', `with(sandbox){${rep_non_print(code)}}`);
    const _proxy = new Proxy(sandbox, {
        has(target, key) {
            if(mixBlack.indexOf(key) != -1){
                return true
            }
            return key in target;
        }
    });
    return fn(_proxy);
};
let micVm = (code, data) => {
    let result;
    // try {
    result = new Function('obj', "with(obj){" + code + "}").apply(data, [data])
    // } catch (err) {
    //     console.error("'" + err.message + "'", " in \n\nCode:\n", code.replace(/;/g, ";\n").replace(/({|})/g, "$1\n"));
    // }
    return result;
}

module.exports = {
    safe: JSafeVmWithBlackList,
    vm: JSvm,
    micVm: micVm
};
