const EventObj = require("./event");
const diff = require("./diff");
const {
    Po,
    generateSubPo
} = require("./Po");

function INT_OBJ(){
    return {
        wtever: false, // async Interrupt flag
        clear: null // Interrupt call
    }
}

function async_diff(ctx) {
    if (ctx.current_render_INT_OBJ) {
        // Interrupt check
        ctx.current_render_INT_OBJ.wtever = true;
        if (ctx.current_render_INT_OBJ.clear)
            ctx.current_render_INT_OBJ.clear()
        // unblock async render task
        ctx.current_render_INT_OBJ = new INT_OBJ();
    }
    (async () => {
        // render mount before
        if(ctx.mounts && ctx.mounts.renderBefore)
            ctx.mounts.renderBefore.call(ctx.Po.data, ctx.el)

        // dirty checking maybe
        let patchArr = await diff(ctx.el, ctx.Po.assemble(), ctx.current_render_INT_OBJ);
        ctx.Po.$bind(patchArr)

        // render mount after
        if(ctx.mounts && ctx.mounts.renderAfter && patchArr.length != 0)
            ctx.mounts.renderAfter.call(ctx.Po.data, ctx.el)
    })();
}

function polyOptions(options){
    // poly old ver
    let {
        el:_ele,
        ele,
        tpl,
        template,
        data,
        watch,
        subPos:components,
        mixwith,
        mount:mounts,
        mounted:_mounts
    } = options;
    return {
        el: ele || _ele,
        tpl: template || tpl,
        data,
        watch,
        components,
        mixwith,
        mount: mounts || _mounts
    }
}

function Poi(options, GlobalJxEnviron) {
    // options
    let {
        el:ele,
        tpl:template,
        data,
        watch,
        components:subPos,
        mixwith,
        mount:mounts
    } = polyOptions(options);
    this.el = ele;
    // on,emit
    // bind evlisenter
    this.Event = new EventObj(this.el);

    // #401 babel es5 leads to mistakes
    
    // async diff render
    this.current_render_INT_OBJ = new INT_OBJ();
    this.render = () => async_diff(this);
    
    // sub components ====\\
    // let subPoi = subPos ? generateSubPo(subPos, this.Event) : undefined
    // sub components ====\\
    // #402 mounted init function
    if (mixwith && mixwith.mounts){
        for (let key in mixwith.mounts) {
            if (key in mounts)
            mounts[key] = () => {
                mixwith.mounts[key].apply(this)
                mounts[key].apply(this)
            };
            else mounts[key] = mixwith.mounts[key];
        }
    }
    this.mounts = mounts
    // instance
    this.Po = new Po(template, data, watch, this.Event, mixwith, GlobalJxEnviron);
    
    // init hook
    if (mounts && mounts.init) mounts.init.apply(this.Po.data);

    // event on rerender
    this.Event.on("_rerender_", () => this.render())
    // first render
    this.el.innerHTML = "";
    this.render();
    
    const that = this;
    // public api
    return {
        $ele: ele,
        $data: that.Po.data,
        $on(...args){
            that.Event.on.apply(that.Event, args)
        },
        $emit(...args){
            that.Event.emit.apply(that.Event, arguments)
        }
    };
}

module.exports = Poi
