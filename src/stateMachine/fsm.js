const {getEvents} = require("./util")

class FSM{
    constructor(conf, data){
        this._config = conf;
        this.data = data
        this.currentState = this._config.initState;
        this._channel= {};
        this.states = this._config.states;
        // this.events = this._config.events;
        if(this._config.events){
            this.defineEvents(this._config.events);
        }else{
            this.defineEvents(getEvents(conf,data));
        }
    }

    // 表现层
    handleEvents(type, ev) {
        if (!this.currentState) return;
        
        var actionTransitionFunction = this.states[this.currentState][type];
        
        if (!actionTransitionFunction) {
            if (this._config.error) this._config.error.call(this, type, ev)
            return;
        }
        
        var nextState = actionTransitionFunction.call(this, type, ev);
        
        this.currentState = nextState;
    }
    
    // 行为层
    defineEvents(events) {
        for (let k in events) {
            var fn = events[k];
            fn.call(this, e => this.$emit(k, e));
            this.$on(k, this.handleEvents);
        }
    }

    
    $emit(evName, ev) {
        if (evName in this._channel) {
            this._channel[evName].call(this, evName, ev);
        }
    }
    
    $on(evName, fn) {
        this._channel[evName] = fn;
    }
}

module.exports = {
    FSM
}