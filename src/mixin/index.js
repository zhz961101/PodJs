
const mixin = {
    fsm: require("./fsm"),
    lisenter: require("./lisenter")
}

if(window)window["PoiMixin"] = mixin

module.exports = mixin