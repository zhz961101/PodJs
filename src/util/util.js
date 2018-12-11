function getType(obj) {
    if (obj instanceof Element) return 'dom';
    return Object.prototype.toString.call(obj).slice(8).slice(0, -1).toLowerCase();
}

function deepClone(data) {
    var type = getType(data);
    var obj;
    if (type === 'array') {
        obj = [];
    } else if (type === 'object') {
        obj = {};
    } else {
        return data;
    }
    if (type === 'array') {
        for (var i = 0, len = data.length; i < len; i++) {
            obj.push(deepClone(data[i]));
        }
    } else if (type === 'object') {
        for (var key in data) {
            obj[key] = deepClone(data[key]);
        }
    }
    return obj;
}

let extend = (o, n) => {
    for (var p in n) {
        if (n.hasOwnProperty(p) && (!o.hasOwnProperty(p)))
            o[p] = n[p];
    }
};

let arrMerge = (a, b) => {
    a.push.apply(a, b);
};

let support_list = ["resize", "load", "click", "dblclick", "change", "blur", "focus", "keydown", "keyup", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "select", "keypress"];

let GetAttrElement = (attr, val) => {
    let e = document.all;
    let a = new Array();
    for (let i = 0; i < e.length; i++) {
        if (e[i].getAttribute(attr) == val) {
            a.push(e[i])
        }
    }
    return a;
}

function proxy_catch_set(that, cb) {
    if (Object.prototype.toString.call(that) == "[object Array]") {
        return proxy_arr(that, cb);
    }
    return new Proxy(that, {
        set(obj, prop, val) {
            if (obj[prop] != val) {
                obj[prop] = val;
                cb();
            }
            return true;
        }
    })
}

function proxy_arr(arr, cb) {
    if (arr.length != 0) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = proxy_catch_set(arr[i], () => cb(arr));
        }
    }
    return new Proxy(arr, {
        set(obj, prop, val) {
            var calling = false
            if (prop == 'length')calling = true
            else if (obj[prop] != val){
                calling = true
            }
            if(calling)cb(obj);
            if(!isNaN(prop))obj[prop] = proxy_catch_set(val, () => cb(obj))
            else obj[prop] = val
            return true;
        }
    })
}


module.exports = {
    deepClone: deepClone,
    extend: extend,
    arrMerge: arrMerge,
    ev_supList: support_list,
    GetAttrElement: GetAttrElement,
    proxyArr: proxy_arr
};
