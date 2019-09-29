
module.exports = class PoiFSM {
    getBefore(target, prop) {
        if (target[prop] instanceof Flow) {
            return target[prop].current;
        }
    }
    initBefore(conf){
        if (conf.states) {
            for (const bindValue in conf.states) {
                if (conf.states.hasOwnProperty(bindValue)) {
                    const fsm = conf.states[bindValue];
                    Object.assign(this, loadFsm(fsm));
                    const oldAfterTransitionCall = fsm.hooks["AfterTransition"];
                    fsm.hooks["AfterTransition"] = (...args) => {
                        oldAfterTransitionCall && oldAfterTransitionCall(...args);
                        this.render()
                    }
                    this[bindValue] = fsm.bind(_=>this.$data);
                }
            }
        }
    }
}
