const EventObj = require("./event");
const diff = require("./diff");
const {
    Po,
    generateSubPo
} = require("./Po");
const {
    domApi
} = require("../util/domApi.js");

function new_INT_OBJ(){
    return {
        wtever: false, // async Interrupt flag
        clear: null // Interrupt call
    }
}

function async_render(__ctx__) {
    if (__ctx__.current_render_INT_OBJ) {
        // Interrupt check
        __ctx__.current_render_INT_OBJ.wtever = true;
        if (__ctx__.current_render_INT_OBJ.clear)
            __ctx__.current_render_INT_OBJ.clear()
        // unblock async render task
        __ctx__.current_render_INT_OBJ = new_INT_OBJ();
    }
    (async () => {
        // dirty checking maybe
        let patchArr = await diff(__ctx__.el, __ctx__.Po.assemble(), __ctx__.current_render_INT_OBJ);
        __ctx__.Po.$bind(patchArr)
    })();
}

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
        (async () => {
            this.$on("_rerender_", () => {
                that.rerender();
            })
            this.el.html("")
            let patchArr = await diff(this.el, this.Po.assemble());
            if (patchArr.length != 0) {
                this.Po.$bind(patchArr)
            }
        })()
    }
    this.current_render_INT_OBJ = new_INT_OBJ();
    this.rerender = () => {
        async_render(this)
    }
    let subPoi = subPos ? generateSubPo(subPos, this.Event) : undefined
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
    let that = _Poi.apply({}, [config.el, tpl_content, config.data, config.watch, config.components, config.mixwith, config.mounted]);
    that.render();
    return that;
}

module.exports = Poi;
