const EventObj = require("./event");
const diff = require("./diff");
const {
    Po,
    generateSubPo
} = require("./Po");
const {
    domApi
} = require("../util/util");

let _Poi = function(finder, template, data, watch, subPos, mixwith, mounts) {
    this.el = domApi.$(finder);
    // on,emit
    this.Event = new EventObj(this.el);
    this.$on = function() {
        this.Event.on.apply(this.Event, arguments)
    };
    this.$emit = function() {
        this.Event.emit.apply(this.Event, arguments)
    };
    // #401 babel es5 leads to mistakes
    let that = this;
    this.render = () => {
        this.el.html(this.Po.assemble())
        this.Po.bind();
        this.$on("_rerender_", () => {
            that.rerender();
        })
    }
    this.rerenderBlock = false
    this.rerender = () => {
        if(this.rerenderBlock)return
        this.rerenderBlock = true
        // dirty checking maybe
        diff(this.el, this.Po.assemble());
        // this.Po.bind();
        this.rerenderBlock = false
    }
    let subPoi = subPos ? generateSubPo(subPos,this.Event) : undefined
    this.Po = new Po(template, data, watch, this.Event, subPoi, mixwith);
    this.$data = this.Po.data;
    // #402 mounted init function
    if (mixwith && mixwith.mounts) {
        for (let key in mixwith.mounts) {
            if (key in mounts) {
                mounts[key] = () => {
                    mixwith.mounts[key].apply(this)
                    mounts[key].apply(this)
                }
            } else {
                mounts[key] = mixwith.mounts[key]
            }
        }
    }
    if (mounts) {
        if (mounts.init) mounts.init.apply(this.Po.data);
    }
    return this;
}

let Poi = function(config) {
    let tpl_content
    if (config.tpl) {
        if (config.tpl[0] == "#") {
            tpl_content = document.querySelector(config.tpl).innerHTML;
            if (tpl_content == undefined) return new Error("not found template element " + config.tpl)
        } else {
            tpl_content = config.tpl
        }
    } else {
        if (config.el[0] == "#") {
            tpl_content = document.querySelector(config.el).innerHTML;
            if (tpl_content == undefined) return new Error("not found element " + config.el)
        } else {
            tpl_content = tpl_content.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        }
    }
    let that = _Poi.apply({}, [config.el, tpl_content, config.data, config.watch, config.pos, config.mixwith, config.mounted]);
    that.render();
    return that;
}

module.exports = Poi;
