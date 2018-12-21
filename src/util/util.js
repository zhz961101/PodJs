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

let support_list = ["resize", "load", "click", "dblclick", "change", "input", "blur", "focus", "keydown", "keyup", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "select", "keypress","mousewheel","scroll"];

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
    if ( getType(that) == "array" ) {
        return proxy_arr(that, cb);
    }
    if ( getType(that) == "object"){
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
    // default
    return that
}

function proxy_arr(arr, cb) {
    if (arr.length != 0) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = proxy_catch_set(arr[i], () => cb(arr));
        }
    }
    // #u1 double callback.fixed
    return new Proxy(arr, {
        set(obj, prop, val) {
            var calling = false
            if (prop == 'length'){
                if(obj[prop] > val){
                    // 仅改变长度不会修改特定prop
                    // pop
                    calling = true
                }
                // else {
                //     // push: 分别需要设置新prop的值并设置length,只用calling一次
                //     // push or add 
                //     void 0;
                // }
            }
            else if (obj[prop] != val){
                calling = true
            }
            if(!isNaN(prop))obj[prop] = proxy_catch_set(val, () => cb(obj))
            else obj[prop] = val
            // render callback
            if(calling)cb(obj);
            return true;
        }
    })
}

const $ = (...args) => document.querySelector.apply(document,args)
const $$ = (...args) => document.querySelectorAll.apply(document,args)

// &gt; => >
// &lt; => <
// ...
const escape2Html = s => s.replace(/&(lt|gt|nbsp|amp|quot);/ig,(all,t)=>({'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'})[t]);
// trim and merge \r\n
const trimBr = s => s.replace(/((\s| )*\r?\n){3,}/g,"\r\n\r\n").replace(/^((\s| )*\r?\n)+/g,'').replace(/((\s| )*\r?\n)+$/g,'');
const mergeSpace = s => s.replace(/(\s| )+/g,' ');
const cleanSriptTag = s => s.replace(/<\s*script.*?>([\S\s]*?)<\/\s*?script[^>\w]*?>/gi,"");
function HTMLClean(text){
    return escape2Html(mergeSpace(trimBr(cleanSriptTag(text))))
}

module.exports = {
    deepClone,
    extend,
    arrMerge,
    ev_supList: support_list,
    GetAttrElement,
    proxyArr: proxy_arr,
    $,$$,
    HTMLClean
};
