const {ev_supList} = require("../util/util");


class EventObj {
    constructor() {
        this.subscribe = {}
    }
    on(channel, fn) {
        let old = this.subscribe[channel]?this.subscribe[channel].func:undefined;
        if (old==undefined) this.subscribe[channel] = {locked:0}
        this.subscribe[channel].func = function(_args) {
            if (typeof old == "function") {
                old(_args);
            }
            fn(_args);
        }
    }
    emit(channel, _args) {
        if(this.subscribe[channel]!==undefined){
            if (this.subscribe[channel].locked>0)return
            else this.block(channel)
            if (typeof this.subscribe[channel].func == "function") {
                this.subscribe[channel].func(_args);
            }
            this.unblock(channel)
        }
    }
    block(channel) {
        if(this.subscribe[channel]==undefined)return
        this.subscribe[channel].locked += 1
    }
    unblock(channel) {
        if(this.subscribe[channel]==undefined)return
        this.subscribe[channel].locked -= 1
    }
    clear(){
        this.subscribe = {};
    }
}
class EventObjForEle extends EventObj {
    constructor(ele) {
        super();
        this.el = ele;
        this.__init_nativeEv();
    }
    __init_nativeEv() {
        ev_supList.forEach((val, index) => {
            this.el.addEventListener(val, e => {
                this.emit(val, e);
            })
        })
    }
    // addEventListener(evName,ele,fn){
    //     this.el.addEventListener(evName, e => {
    //         if(e.target==ele){
    //             fn()
    //         }
    //     })
    // }
}

module.exports = EventObjForEle;
