const {
    deepClone,
    extend,
    GetAttrElement,
    proxyArr
} = require("../util/util");
const TplEng = require("./template");
const Jsvm = require("../util/JsVm");


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
            if (localPo[localCur] == undefined) {
                localPo.push(sub.Clone(tempData))
            }
            let temp = localPo[localCur].assemble(supper, localCur)
            reslove = reslove.replace(_s, temp)
            localCur += 1
        }
    }
    return reslove
}

let _init_DateValueProperty = (data, _ev) => {
    let source = deepClone(data)
    for (let variable in data) {
        let setVal = data[variable];
        let option = {}
        if (Object.prototype.toString.call(setVal) == "[object Array]") {
            // #101 length problem
            setVal = proxyArr(setVal, newVal => {
                _ev.emit("SET_" + variable, newVal);
                _ev.emit("_rerender_");
                if (source[variable].length == newVal.length) return
                source[variable] = newVal;
            })
        }
        if (typeof setVal === "function") {
            if (/_ev.emit/g.test(setVal.toString()))
                continue
            data[variable] = function() {
                let _resTemp = setVal.apply(data, arguments)
                return _resTemp
            }
            continue;
        } else {
            option.get = () => {
                return source[variable];
            }
        }
        option.set = newVal => {
            if (source[variable] == newVal) return
            source[variable] = newVal;
            _ev.emit("SET_" + variable, newVal);
            _ev.emit("_rerender_");
        }
        Object.defineProperty(data, variable, option)
        data[variable] = setVal;
    }
    return data;
}

let hitchOnEv = (_evManger, _on, data, localArr) => {
    for (var event_ in _on) {
        if (_on.hasOwnProperty(event_)) {
            let thisOption = _on[event_],
                evName = thisOption.eventName,
                coStr = thisOption.codeStr,
                that_data = data,
                ele = thisOption.ele,
                withData = {};
            if (ele.attributes["PoiId"] != undefined) {
                let _index = ele.attributes["PoiId"].nodeValue
                withData = localArr[_index].data
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
let hitchBindEv = (_evManger, _bind, data, localArr) => {
    for (var _ev in _bind) {
        if (_bind.hasOwnProperty(_ev)) {
            let thisOption = _bind[_ev],
                evName = thisOption.eventName,
                coStr = thisOption.codeStr,
                that_data = data,
                ele = thisOption.ele,
                withData = {};
            if (ele.attributes["PoiId"] != undefined) {
                let _index = ele.attributes["PoiId"].nodeValue
                withData = localArr[_index].data
            }
            if (evName == "class")
                evName = "className"
            ele[evName] = Jsvm.safe("return(" + coStr + ")", Object.assign(deepClone(withData), that_data));
            // init value
            _evManger.on("_rerender_", () => {
                if (ele && ele.parentNode != null) {
                    // require("../util/JsVm.js").micVm(coStr, that_data);
                    ele[evName] = Jsvm.safe("return(" + coStr + ")", Object.assign(deepClone(withData), that_data))
                }
            })
        }
    }
};

let hitchWath = (watch, _ev) => {
    for (let variable in watch) {
        if (typeof watch[variable] === "function") {
            _ev.on("SET_" + variable, (newVal) => {
                watch[variable](newVal);
            })
        }
    }
}

let Po = function(template, data, watch, evManger, subPos, mixwith) {
    if (mixwith) {
        extend(data, deepClone(mixwith.$pureData));
    }
    this.$pureData = deepClone(data)
    // tpl
    this.Clone = _data => {
        return {
            $pureData: Object.assign(deepClone(_data), this.$pureData),
            tpl: this.tpl,
            data: _init_DateValueProperty(deepClone(Object.assign(deepClone(_data), deepClone(this.$pureData))), evManger),
            assemble: function(data, _id) {
                return this.tpl.joint(Object.assign(this.data, data), _id)
            }
        }
    }
    // data
    this.data = _init_DateValueProperty(data, evManger)
    //
    // subPo
    this.tpl = new TplEng(template, "{{", "}}"); //new Template(template,subPos);
    if (watch) hitchWath(watch, evManger);
    // error everyday
    //
    this.$localPo = []
    this.assemble = function(data, _id) {
        if (data != undefined) {
            Object.assign(deepClone(data), this.data)
        } else {
            data = deepClone(this.data)
        }
        let res = this.tpl.joint(data, _id)
        if (subPos != undefined) {
            return replaceSubNode(res, subPos, this.data, this.$localPo)
        } else {
            return res
        }
    };

    this.$bind = patchs => {
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
            hitchOnEv(evManger, onArr, this.data, this.$localPo)
        if (bindArr.length != 0)
            hitchBindEv(evManger, bindArr, this.data, this.$localPo);
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
