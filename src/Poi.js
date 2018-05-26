const EventObj = require("./event.js");
const TplEng = require("./template.js");
const Jsvm = require("./util/JsVm.js");
const {
    deepClone,
    extend,
    GetAttrElement
} = require("./util/util.js");

const evIdSuffix = "event-id";

let _focus = document;

let Po = function(name, template, data, watch, evManger, subPos, mixwith) {
    if (mixwith) {
        extend(data, deepClone(mixwith.data));
    }
    this.name = name;
    // tpl

    let _init_DateValueProperty = (data, _ev) => {
        for (let variable in data) {
            let setVal = data[variable];
            let option = {}
            if (typeof setVal === "function") {
                option.get = () => {
                    return setVal(data);
                }
            } else {
                option.get = () => {
                    return this[variable];
                }
            }
            option.set = newVal => {
                this[variable] = newVal;
                _ev.emit("SET_" + variable, newVal);
                _ev.emit("_rerender_");
            }
            Object.defineProperty(data, variable, option)
            data[variable] = setVal;
        }
        return data;
    }
    // data
    this.data = _init_DateValueProperty(data, evManger)
    //
    this.tpl = new TplEng(template, "{{", "}}"); //new Template(template,subPos);
    let hitchOnEv = (_evManger, _on) => {
        for (var event_ in _on) {
            if (_on.hasOwnProperty(event_)) {
                let thisOption = _on[event_],
                    evName = thisOption.eventName,
                    evId = thisOption.id,
                    coStr = thisOption.codeStr,
                    that_data = this.data;
                _evManger.on(evName, e => {
                    _focus = evId;
                    if (e.target.getAttribute("data-event-id") === evId) {
                        let dataobj = Object.assign(that_data, {
                            e: e,
                            self: e.target
                        })
                        require("./util/JsVm.js").safe(coStr, that_data);
                    }
                })
            }
        }
        // on_ev end
    }
    this._ev = this.tpl.tpl_events;
    hitchOnEv(evManger, this._ev.on);

    let hitchWath = (watch, _ev) => {
        for (let variable in watch) {
            if (typeof watch[variable] === "function") {
                _ev.on("SET_" + variable, (newVal) => {
                    watch[variable](newVal);
                })
            }
        }
    }
    hitchWath(watch, evManger);
    this.assemble = () => {
        return this.tpl.joint(this.data)
    };
    let hitchBindEv = (_evManger, _bind) => {
        for (var _ev in _bind) {
            if (_bind.hasOwnProperty(_ev)) {
                let thisOption = _bind[_ev],
                    evName = thisOption.eventName,
                    evId = thisOption.id,
                    valName = thisOption.codeStr,
                    ele = GetAttrElement("data-event-id", evId)[0];
                ele[evName] = this.data[valName];
                // init value
                _evManger.on("SET_" + valName, newVal => {
                    if (ele) {
                        ele[evName] = newVal;
                    }
                })
            }
        }
    };
    this.bind = () => {
        hitchBindEv(evManger, this._ev.bind);
    };
}

let _Poi = function(id, template, data, watch, subPos, mixwith) {
    let _$ = function(id) {
        let _ele = document.querySelector(id);
        _ele.html = function(_newHtml) {
            if (this.empty) {
                return ''
            }
            if (!_newHtml) {
                return this.innerHTML;
            } else {
                this.innerHTML = _newHtml;
                return _newHtml;
            }
        };
        return _ele;
    }
    this.el = _$(id);
    // on,emit
    this.Event = new EventObj(_$(id));
    this.$on = function() {
        this.Event.on.apply(this.Event, arguments)
    };
    this.$emit = function() {
        this.Event.emit.apply(this.Event, arguments)
    };
    this.render = () => {
        this.el.html(this.Po.assemble())
        this.Po.bind();
        this.$on("_rerender_", () => {
            that.rerender();
            GetAttrElement("data-"+evIdSuffix,_focus)[0].focus();
        })
    }
    this.rerender = () => {
        // dirty checking maybe
        // this.render()
        this.el.html(this.Po.assemble())
        this.Po.bind();
    }
    let that = this;
    // item
    this.Po = new Po("root", template, data, watch, this.Event, subPos, mixwith);
    this.$data = this.Po.data;
    return this;
}

let Poi = function(config) {
    let that_tpl = document.querySelector(config.id).innerHTML;
    let that = _Poi.apply({}, [config.id, that_tpl, config.data, config.watch, undefined, config.mixwith]);
    that.render();
    return that;
}

module.exports = Poi;
