const {
    deepClone,
    extend,
    GetAttrElement
} = require("../util/util");
const TplEng = require("./template");
const Jsvm = require("../util/JsVm");

// const debugObj = require("../util/debug")

let replaceSubNode = (html, subPos, supper) => {
    let resloveData = attrs => {
        let res = {}
        if (attrs == undefined || attrs.length == 0) return res
        let arr = attrs.split(" ")
        let re = new RegExp(`(.+?)=(["'])(.+?)\\2`)
        for (let attr of arr) {
            if (attr.trim() == "") continue
            let reg$arr = re.exec(attr)
            res[reg$arr[1]] = reg$arr[3]
        }
        return res
    }
    let reslove = html
    for (let subName in subPos) {
        let sub = subPos[subName]
        // <(rLink)( .+?)>(.+)?<\/\1>
        let re = new RegExp("<(" + subName + ")(( [^<> ]*)*)>([^<>]*)<\/" + subName + ">", "gi")
        let subArr = html.match(re)
        if (!subArr) continue
        for (let _si in subArr) {
            let _s = subArr[_si]
            re = new RegExp("<(" + subName + ")(( [^<> ]*)*)>([^<>]*)<\/" + subName + ">", "gi")
            let reg$arr = re.exec(_s)
            let tempData = resloveData(reg$arr[2])
            tempData._content = reg$arr[4]
            if (supper) Object.assign(tempData, supper)
            let temp = sub.assemble(tempData)
            reslove = reslove.replace(_s, temp)
        }
    }
    return reslove
}

let Po = function(template, data, watch, evManger, subPos, mixwith) {
    if (mixwith) {
        extend(data, deepClone(mixwith.data));
    }
    // tpl

    let _init_DateValueProperty = (data, _ev) => {
        for (let variable in data) {
            let setVal = data[variable];
            let option = {}
            if (typeof setVal === "function") {
                data[variable] = function() {
                    let _resTemp = setVal.apply(data, arguments)
                    _ev.emit("_rerender_");
                    return _resTemp
                }
                continue;
                // option.get = ()=>{
                //     return setVal(data)
                // }
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
    // let dbg = new debugObj("_init_DateValueProperty")
    this.data = _init_DateValueProperty(data, evManger)
    // dbg.log()
    //
    // subPo
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
                    if (e.target.getAttribute("data-event-id") === evId) {
                        let dataobj = Object.assign(that_data, {
                            e: e,
                            self: e.target
                        })
                        // require("../util/JsVm.js").micVm(coStr, that_data);
                        Jsvm.safe(coStr, that_data);
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
    if (watch) hitchWath(watch, evManger);
    this.assemble = function(data) {
        if (data) {
            Object.assign(this.data, data)
        }
        let res = this.tpl.joint(this.data)
        if (subPos) {
            return replaceSubNode(res, subPos, this.data)
        } else {
            return res
        }
    };
    let hitchBindEv = (_evManger, _bind) => {
        for (var _ev in _bind) {
            if (_bind.hasOwnProperty(_ev)) {
                let thisOption = _bind[_ev],
                    evName = thisOption.eventName,
                    evId = thisOption.id,
                    valName = thisOption.codeStr,
                    ele = GetAttrElement("data-event-id", evId)[0];
                if (ele == undefined) return;
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
        if (subPos) {
            for (let subi in subPos) {
                subPos[subi].bind()
            }
        }
        hitchBindEv(evManger, this._ev.bind);
    };
}

let generateSubPo = function(poList, evManger) {
    let res = {}
    for (let poName in poList) {
        let sub = poList[poName],
            tplText
        if (sub.tpl[0] == "#") {
            tplText = document.querySelector(sub.tpl).innerHTML;
        } else {
            tplText = sub.tpl
        }
        res[poName] = new Po(tplText, deepClone(sub.data), {}, evManger)
    }
    return res
}

module.exports = {
    Po,
    generateSubPo
};
