const {
    deepClone,
    extend,
    GetAttrElement,
    proxyArr
} = require("./util/util");
const attrRoster = require("./util/attrRoster");
// const TplEng = require("./template");
const {
    JxTpl
} = require("./jx")
const Jsvm = require("./util/JsVm");

// let replaceSubNode = (html, subPos, supper, localPo) => {
//     let resloveData = attrs => {
//         let res = {}
//         if (attrs == undefined || attrs.length == 0) return res
//         let arr = attrs.split(" ")
//         let re = new RegExp(`(.+?)=(["'])(.+?)\\2`)
//         for (let attr of arr) {
//             if (attr.trim() == "") continue
//             let reg$arr = re.exec(attr)
//             res[reg$arr[1]] = reg$arr[3]
//         }
//         return res
//     }
//     let reslove = html
//     let localCur = 0
//     for (let subName in subPos) {
//         let sub = subPos[subName]
//         let re = new RegExp("<(" + subName + ")(( [^<> ]*)*)>([^<>]*)<\/" + subName + ">", "gi")
//         let subArr = html.match(re)
//         if (!subArr) continue
//         for (let _si in subArr) {
//             let _s = subArr[_si]
//             re = new RegExp("<(" + subName + ")(( [^<> ]*)*)>([^<>]*)<\/" + subName + ">", "gi")
//             let reg$arr = re.exec(_s)
//             let tempData = resloveData(reg$arr[2])
//             tempData._content = reg$arr[4]
//             if (localPo[localCur] == undefined) {
//                 localPo.push(sub.Clone(tempData))
//             }
//             let temp = localPo[localCur].assemble(supper, localCur)
//             reslove = reslove.replace(_s, temp)
//             localCur += 1
//         }
//     }
//     return reslove
// }

let _init_DateValueProperty = (data, EventManager) => {
    let source = deepClone(data)
    for (let variable in data) {
        let srcVal = data[variable];
        let option = {}
        if (Object.prototype.toString.call(srcVal) == "[object Array]") {
            // #101 length problem
            srcVal = proxyArr(srcVal, newVal => {
                EventManager.emit("SET_" + variable, newVal);
                EventManager.emit("_rerender_");
                if (source[variable].length == newVal.length) return
                source[variable] = newVal;
            })
        }
        if (typeof srcVal === "function") {
            if (/EventManager.emit/g.test(srcVal.toString()))
                continue
            // function in data
            data[variable] = (...args) => srcVal.apply(data, args)
            continue;
        } else {
            option.get = () => source[variable];
        }
        option.set = newVal => {
            if (source[variable] == newVal) return
            source[variable] = newVal;
            EventManager.emit("SET_" + variable, newVal);
            EventManager.emit("_rerender_");
        }
        Object.defineProperty(data, variable, option)
        data[variable] = srcVal;
    }
    return data;
}

let hitchOnEv = (EventManager, onTypeEventArr, data, localArr) => {
    for (var event_ in onTypeEventArr) {
        if (onTypeEventArr.hasOwnProperty(event_)) {
            let thisOption = onTypeEventArr[event_],
                evName = thisOption.eventName,
                coStr = thisOption.codeStr,
                that_data = data,
                ele = thisOption.ele,
                withData = {};
            EventManager.addEventLookUp(evName)
            if (ele.attributes["PoiId"] != undefined) {
                let _index = ele.attributes["PoiId"].nodeValue
                withData = localArr[_index].data
            }
            EventManager.on(evName, e => {
                if (e.target === ele) {
                    let dataobj = Object.assign(that_data, {
                        e: e,
                        self: e.target
                    }, withData)
                    Jsvm.safe(coStr, that_data);

                    EventManager.emit("_rerender_");
                }
            })
        }
    }
    // on_ev end
}
let hitchBindEv = (EventManager, bindTypeEventArr, data, localArr) => {
    for (var EventConf in bindTypeEventArr) {
        if (bindTypeEventArr.hasOwnProperty(EventConf)) {
            let thisOption = bindTypeEventArr[EventConf],
                eventName = thisOption.eventName,
                innerCODE = thisOption.codeStr,
                that_data = data,
                ele = thisOption.ele,
                withData = {};
            if (ele.attributes["PoiId"] != undefined) {
                let _index = ele.attributes["PoiId"].nodeValue
                withData = localArr[_index].data
            }
            if (eventName == "class")
                eventName = "className"
            ele[eventName] = Jsvm.safe("return(" + innerCODE + ")", Object.assign(deepClone(withData), that_data));
            // init value
            EventManager.on("_rerender_", () => {
                if (ele && ele.parentNode != null) {
                    // require("../util/JsVm.js").micVm(innerCODE, that_data);
                    ele[eventName] = Jsvm.safe("return(" + innerCODE + ")", Object.assign(deepClone(withData), that_data))
                }
            })
        }
    }
};

let hitchWath = (watchTypeEventArr, EventManager) => {
    for (let wathValueOfKey in watchTypeEventArr) {
        if (typeof watchTypeEventArr[wathValueOfKey] === "function") {
            EventManager.on("SET_" + wathValueOfKey, (newVal) => {
                watchTypeEventArr[wathValueOfKey](newVal);
            })
        }
    }
}

function Po(JxTplText, data, watch, evManger, mixwith, Jx) {
    // mixwith
    if (mixwith) extend(data, deepClone(mixwith.$pureData));

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
    this.tpl = new JxTpl(JxTplText, Jx); //new Template(template,subPos);
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
        // if (subPos != undefined) {
        //     return replaceSubNode(res, subPos, this.data, this.$localPo)
        // } else {
        return res
        // }
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
            const isOn = node => /on:/g.test(node.nodeName);
            const isBind = node => /bind:/g.test(node.nodeName);

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
                    let evName = attr.nodeName.split(":")[1]
                    if(evName in attrRoster)evName = attrRoster[evName]
                    bindArr.push({
                        ele: ele,
                        eventName: evName,
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
    // banned
    // =========================================
    // let res = {}
    // for (let poName in poList) {
    //     let sub = poList[poName],
    //         tplText
    //     if (sub.tpl[0] == "#") {
    //         tplText = document.querySelector(sub.tpl).innerHTML;
    //     } else {
    //         tplText = sub.tpl
    //     }
    //     res[poName] = new Po(tplText, deepClone(sub.data), {}, evManger)
    // }
    // return res
}

module.exports = {
    Po,
    generateSubPo
};
