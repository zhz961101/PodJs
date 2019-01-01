// const {
//     ev_supList
// } = require("./util/util");

class Event {
    constructor() {
        this.subscribe = {}
    }
    on(channel, fn) {
        let old = this.subscribe[channel] ? this.subscribe[channel].func : undefined;
        if (old == undefined) this.subscribe[channel] = {}
        this.subscribe[channel].func = function(_args) {
            if (typeof old == "function") {
                old(_args);
            }
            fn(_args);
        }
    }
    emit(channel, _args) {
        if (this.subscribe[channel] !== undefined) {
            if (typeof this.subscribe[channel].func == "function") {
                this.subscribe[channel].func(_args);
            }
        }
    }
    clear() {
        this.subscribe = {};
    }
}
class EventOnEle extends Event {
    constructor(ele) {
        super();
        this.el = ele;
        // this.__init_nativeEv();
        this.loopUp = []
    }
    // __init_nativeEv() {
    //     ev_supList.forEach(evName => {
    //         let fn_body = e => this.emit(evName, e)
    //         this.el.addEventListener(evName, fn_body, true)
    //     })
    // }
    addEventLookUp(evName){
        if(this.loopUp.indexOf(evName) == -1){
            this.el.addEventListener(evName, e => this.emit(evName, e), true)
            this.loopUp.push(evName)
        }
    }
}

module.exports = EventOnEle;
