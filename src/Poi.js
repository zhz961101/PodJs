const Poi = require("./core/Poi")
const {
    $,
    HTMLClean
} = require("./core/util/util")
const {
    Jx
} = require("./core/jx")
const {
    creatCustomEle,
    tplLoader
} = require("./component/component")
const {
    FSM
} = require("./stateMachine/fsm")


const GlobalJxEnviron = new Jx()

function configWapper(config) {
    // ele option
    if (!(config.el instanceof Element)) {
        let s = config.el[0];
        if (s == "#") config.el = $(config.el)
        else config.el = $("#" + config.el)
    }
    // tpl option
    if (config.tpl) {
        let s = config.tpl[0];
        if (s == "#") {
            // tpl selector
            config.tpl = HTMLClean($(config.tpl).innerHTML);
        }
    } else {
        config.tpl = HTMLClean(config.el.innerHTML)
    }

    // other ...
    return config
}

function PoiApi(config) {
    config = configWapper(config)
    let that = Object.create(null);
    that = Poi.call(that, config, GlobalJxEnviron);

    if(config.states && config.initState){
        that.$M = new FSM(config, that.$data)
    }

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