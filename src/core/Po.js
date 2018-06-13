const {
    deepClone,
    extend,
    GetAttrElement
} = require("../util/util");
const TplEng = require("./template");
const Jsvm = require("../util/JsVm");

// const debugObj = require("../util/debug")

let replaceSubNode = (html, subPos, supper, localPo) => {
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
    let localCur = 0
    for (let subName in subPos) {
        let sub = subPos[subName]
        let re = new RegExp("<(" + subName + ")(( [^<> ]*)*)>([^<>]*)<\/" + subName + ">", "gi")
        let subArr = html.match(re)
        if (!subArr) continue
        for (let _si in subArr) {
            let _s = subArr[_si]
            re = new RegExp("<(" + subName + ")(( [^<> ]*)*)>([^<>]*)<\/" + subName + ">", "gi")
            let reg$arr = re.exec(_s)
            let tempData = resloveData(reg$arr[2])
            tempData._content = reg$arr[4]
            if (supper) {
                Object.assign(tempData, supper)
            }
            if (localPo[localCur] == undefined) {
                localPo.push(sub.Clone(tempData))
            } else {
                localPo[localCur].data = Object.assign(deepClone(tempData), sub.data)
            }
            let temp = localPo[localCur].assemble(tempData, localCur)
            reslove = reslove.replace(_s, temp)
            localCur += 1
        }
    }
    return reslove
}

let Po = function(template, data, watch, evManger, subPos, mixwith) {
    if (mixwith) {
        extend(data, deepClone(mixwith.data));
    }
    this.$pureData = deepClone(data)
    // tpl
    this.Clone = _data => {
        return new Po(template, deepClone(Object.assign(_data, this.$pureData)), deepClone(watch), evManger, subPos, mixwith)
    }
    let _init_DateValueProperty = (data, _ev) => {
        for (let variable in data) {
            let setVal = data[variable];
            let option = {}
            if (typeof setVal === "function") {
                if (/_ev.emit/g.test(setVal.toString()))
                    continue
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
                if (this[variable] == newVal) return
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
    this.$localPo = []
    if (subPos != undefined)
        template = replaceSubNode(template, subPos, this.data, this.$localPo)
    this.tpl = new TplEng(template, "{{", "}}"); //new Template(template,subPos);

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
    // error everyday
    this.assemble = function(data, _id) {
        evManger.block("_rerender_")
        if (data != undefined) {
            Object.assign(data, this.data)
        } else {
            data = deepClone(this.data)
        }
        evManger.unblock("_rerender_")
        return this.tpl.joint(data, _id)
        // if (subPos!=undefined) {
        //     return replaceSubNode(res, subPos, this.data, this.$localPo)
        // } else {
        //     return res
        // }
    };
    let hitchOnEv = (_evManger, _on) => {
        for (var event_ in _on) {
            if (_on.hasOwnProperty(event_)) {
                let thisOption = _on[event_],
                    evName = thisOption.eventName,
                    coStr = thisOption.codeStr,
                    that_data = this.data,
                    ele = thisOption.ele,
                    withData = {};
                if (ele.attributes["PoiId"] != undefined) {
                    let _index = ele.attributes["PoiId"].nodeValue
                    withData = this.$localPo[_index].data
                }
                _evManger.on(evName, e => {
                    if (e.target === ele) {
                        let dataobj = Object.assign(that_data, {
                            e: e,
                            self: e.target
                        }, withData)
                        // require("../util/JsVm.js").micVm(coStr, that_data);
                        Jsvm.safe(coStr, that_data);
                    }
                })
            }
        }
        // on_ev end
    }
    let hitchBindEv = (_evManger, _bind) => {
        for (var _ev in _bind) {
            if (_bind.hasOwnProperty(_ev)) {
                let thisOption = _bind[_ev],
                    evName = thisOption.eventName,
                    coStr = thisOption.codeStr,
                    that_data = this.data,
                    ele = thisOption.ele,
                    withData = {};
                if (ele.attributes["PoiId"] != undefined) {
                    let _index = ele.attributes["PoiId"].nodeValue
                    withData = this.$localPo[_index].data
                }
                if (evName == "class")
                    evName = "className"
                ele[evName] = Jsvm.safe("return(" + coStr + ")", Object.assign(withData, that_data));
                // init value
                _evManger.on("_rerender_", () => {
                    if (ele && ele.parentNode != null) {
                        // require("../util/JsVm.js").micVm(coStr, that_data);
                        ele[evName] = Jsvm.safe("return(" + coStr + ")", Object.assign(withData, that_data))
                    }
                })
            }
        }
    };
    this.bind = patchs => {
        // if (subPos) {
        //     for (let subi in subPos) {
        //         subPos[subi].bind()
        //     }
        // }
        if (patchs.length == 0) return
        let bindArr = [],
            onArr = [];
        let splitEv = ele => {
            if (ele.nodeType == 3) return
            if (ele.children.length != 0) {
                for (let _chi in ele.children) {
                    if (_chi == "length") break
                    let _ch = ele.children[_chi]
                    splitEv(_ch)
                }
            }
            let attrs = ele.attributes
            if (attrs.length == 0) return
            let isOn = node => {
                return /on:/g.test(node.nodeName)
            }
            let isBind = node => {
                return /bind:/g.test(node.nodeName)
            }
            for (let attri in attrs) {
                let attr = attrs[attri]
                if (isOn(attr)) {
                    onArr.push({
                        ele: ele,
                        eventName: attr.nodeName.split(":")[1],
                        codeStr: attr.nodeValue
                    })
                }
                if (isBind(attr)) {
                    bindArr.push({
                        ele: ele,
                        eventName: attr.nodeName.split(":")[1],
                        codeStr: attr.nodeValue
                    })
                }
            }
        }
        for (let _patchi in patchs) {
            let _patch = patchs[_patchi]
            if (_patch.option == "add" || _patch.option == "attributesChange") {
                splitEv(_patch.ele)
            }
        }
        if (onArr.length != 0)
            hitchOnEv(evManger, onArr)
        if (bindArr.length != 0)
            hitchBindEv(evManger, bindArr);
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
