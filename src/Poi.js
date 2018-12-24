const Poi = require("./core/Poi")
const {
    $,
    HTMLClean
} = require("./util/util")
const {
    Jx
} = require("./core/jx")
const {
    creatCustomEle,
    tplLoader
} = require("./component/component")


const GlobalJxEnviron = new Jx()

function optionsWapper(options) {
    // ele option
    if (!(options.el instanceof Element)) {
        let s = options.el[0];
        if (s == "#") options.el = $(options.el)
        else options.el = $("#" + options.el)
    }
    // tpl option
    if (options.tpl) {
        let s = options.tpl[0];
        if (s == "#") {
            // tpl selector
            options.tpl = HTMLClean($(options.tpl).innerHTML);
        }
    } else {
        options.tpl = HTMLClean(options.el.innerHTML)
    }

    // other ...
    return options
}

function PoiApi(options) {
    options = optionsWapper(options)
    let that = Object.create(null);
    that = Poi.call(that, options);
    return that;
}

PoiApi.mod = (...args) => GlobalJxEnviron.mod.apply(GlobalJxEnviron, args)
PoiApi.ele = function cusEle(name, option) {
    let innerOp = option
    let html = `<style>${option.css || ""}</style>` + (option.tpl || "")
    delete innerOp.tpl
    delete innerOp.extern
    delete innerOp.css
    try {
        creatCustomEle(name, html, option, option.extern)
    } catch (err) {
        console.warn(err.message)
    }
}
PoiApi.loadEle = tplLoader

module.exports = PoiApi