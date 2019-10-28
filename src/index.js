const JxParser = require("./jx");
const diff_patch = require("./diff");
const PoiEle = require("./ele");
const {
    throttle,
    rebuild,
    isString,
    tpof,
    mergeFunc,
    get
} = require("./utils");

const reservedWord = ["renderBefore", "renderAfter", "getBefore", "setBefore", "initBefore", "created", "$", "tpl", "$conf"]
const hooksName = ["renderBefore", "renderAfter", "getBefore", "setBefore", "initBefore", "created"]

function need_pxy(o) {
    return ["[object Array]", "[object Object]"].indexOf(tpof(o)) != -1;
}

const poiJxParser = new JxParser();

function JXParse(jx) {
    if (!jx) return _ => "";
    let htmlGen = poiJxParser.complie(jx);
    return data => Array.from(htmlGen(data)).join("")
}

function proxyCallBack(target, cb, super_prop, that) {
    return new Proxy(target, {
        get(target, prop) {
            let super_prop_i = super_prop || [];

            if (that.getBefore)
                if (ret = that.getBefore(target, prop))
                    return ret;

            super_prop_i.push(prop);
            if (need_pxy(target[prop]))
                return proxyCallBack(target[prop], cb, super_prop_i, that);
            return target[prop];
        },
        set(target, prop, value, proxy) {
            let super_prop_i = super_prop || [];

            if (that.setBefore)
                if (that.setBefore(target, prop))
                    return;

            if (target[prop] == value) return Reflect.set(target, prop, value, proxy);
            target[prop] = value;
            super_prop_i.push(prop);
            cb(super_prop_i, value);
            return Reflect.set(target, prop, value, proxy);
        }
    })
}

class Poi {
    static get Ele(){
        return PoiEle;
    }
    static LoadTpl(url, $poi) {
        get(url).then(res => {
            $poi.tpl = res;
            $poi.tplLoader()
            $poi.render()
        });
    }
    static HTML(dom) {
        if (dom instanceof HTMLElement) {
            return dom.innerHTML;
        } else if (typeof dom == "string") {
            return document.querySelector(dom).innerHTML;
        }
        return "null"
    }
    static Mixin(...plugs) {
        if (plugs.length == 0) return Poi;
        let mix = {};
        hooksName.forEach(prop => {
            for (const plug of plugs) {
                if (plug.prototype[prop])
                    mix[prop] = mergeFunc(mix[prop], plug.prototype[prop]);
            }
        });
        return class extends Poi {
            constructor(...args) {
                super(...args)
                Object.assign(this, mix)
            }
        }
    }
    constructor(conf) {
        this.$conf = conf || {}
    }
    tplLoader() {
        if (!isString(this.tpl)) return;
        // parse template function
        this.$tpl = JXParse(this.tpl)
    }
    init() {
        this.initBefore && this.initBefore.call(this, this.$conf)

        // wapper $data from [this]
        this.$InitData = rebuild(this, reservedWord)

        // bind data and method
        this.$data = proxyCallBack(this.$InitData, (cl, v) => this.render(cl, v), [], this);

        // limit fps render, default 15 fps
        this.$render = throttle(this._MustRender, 1000 / 15)

        // parse template function
        this.tplLoader()

        // call created function
        this.created && this.created(this)
    }
    _MustRender() {
        if (!this.$tpl) return;
        this.renderBefore && this.renderBefore.call(this);
        const newHTML = this.$tpl(this.$data);
        // console.log(newHTML);
        const attrOps = diff_patch(this.$, newHTML);
        this.opslaoder && this.opslaoder(attrOps);
        this.renderAfter && this.renderAfter.call(this);
    }
    render(callChain, value) {
        this.$render();
    }
}

if (window) window["Poi"] = Poi;

module.exports = Poi;