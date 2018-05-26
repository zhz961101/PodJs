const {ev_supList} = require("./util/util.js");


var isFunction = (obj)=>{
    return typeof obj === "function"
}

class EventObj {
    constructor() {
        this.subscribe = {}
    }
    on(channel, fn) {
        let old = this.subscribe[channel];
        this.subscribe[channel] = function(_args) {
            if (isFunction(old)) {
                old(_args);
            }
            fn(_args);
        }
    }
    emit(channel, _args) {
        if(this.subscribe[channel]!==undefined){
            if (isFunction(this.subscribe[channel])) {
                this.subscribe[channel](_args);
            }
        }
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
}

module.exports = EventObjForEle;
