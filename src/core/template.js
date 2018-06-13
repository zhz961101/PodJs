const JsVm = require("../util/JsVm.js");
const {
    deepClone
} = require("../util/util.js");
const evIdSuffix = "event-id";

var randHash = H_length => {
    H_length = H_length || 10;
    let res = "",
        $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        maxPos = $chars.length;　　
    for (let i = 0; i < H_length; i++) {
        res += $chars.charAt(Math.floor(Math.random() * maxPos));　　
    }
    return res
}
//
// this is F!!! shit!
//
//
// let prehtml = (html ,evManger)=>{
//     // afterJoint(html) {
//     let insert_item = (str, item, index) => {
//         let newstr = ""; //初始化一个空字符串
//         let tmp = str.substring(0, index);
//         let estr = str.substring(index, str.length);
//         newstr += tmp + item + estr;
//         return newstr;
//     }
//     let repRegArr = (text, s_reg, repStr) => {
//         text = text.replace(s_reg, "");
//         return insert_item(text, repStr, text.indexOf(">"));
//     }
//     let rep_non_print = (text) => {
//         return text.replace("\n", "\\n").replace("\t", "\\t").replace("\f", "\\f").replace("\v", "\\v").replace("\r", "\\r")
//     }
//     let pushEventTo = (arr, option_html, hash_id) => {
//         let eReg = / (bind|on|model):(.+?)=(\\?('|")([\s\S]+?)\\?\4)/g;
//         let _option = eReg.exec(option_html)
//         arr[_option[1]].push({
//             id: hash_id,
//             eventName: _option[2],
//             codeStr: rep_non_print(_option[5])
//         })
//     }
//     let tagReg = /<[\s\S]+?>/g;
//     let eventReg = / (bind|on|model):(.+?)=(\\?('|")([\s\S]+?)\\?\4)/g;
//     let tagArr = html.match(tagReg);
//     let textArr = html.split(tagReg);
//     for (var i = 0; i < tagArr.length; i++) {
//         let attributes = tagArr[i].match(eventReg)
//         if (attributes) {
//             let hash_id = randHash();
//             if (attributes.length > 1) {
//                 for (let j = 0; j < attributes.length; j++) {
//                     pushEventTo(evManger, attributes[j], hash_id)
//                 }
//             } else if (attributes.length === 1) {
//                 pushEventTo(evManger, attributes[0], hash_id)
//             }
//             tagArr[i] = repRegArr(tagArr[i], eventReg, " data-" + evIdSuffix + "='" + hash_id + "'")
//         }
//     }
//     let newHeml = textArr[0];
//     for (let i = 0; i < tagArr.length; i++) {
//         newHeml += tagArr[i];
//         newHeml += textArr[i + 1] ? textArr[i + 1] : "";
//     }
//     return newHeml;
// }

let afterJoint = (_html, poi_id)=>{
    let re = /<([^/]+?)( [^<>]+)*>/g
    let tagArr = _html.match(re)
    for (let tag of tagArr) {
        re = /<([^/]+?)( [^<>]+)*>/g
        let option = re.exec(tag)[2]
        if(/([^<>]+):([^<>]+)=('|")[^<>]+?\3/g.test(option)){
            _html = _html.replace(option, option+" PoiId=\""+poi_id+"\"")
        }
    }
    return _html
}

class TemplateEngine {
    constructor(html, preMark, tailMark) {
        let fixRegKeyWord = str => str === undefined ? null : str.replace(/([$|{|}|(|)|.|\\|*|+|?|^|\||\[|\]])/g, "\\$1");
        preMark = fixRegKeyWord(preMark) || "<%";
        tailMark = fixRegKeyWord(tailMark) || "%>";
        let re = new RegExp(preMark + "(.+?)" + tailMark, "g"),
            reExp = /(^( )?(var|let|if|for|else|switch|case|default|break|{|}|;))(.+)?/g,
            cursor = 0,
            code = 'var r=[];\n',
            match;
        let add = function(line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        }
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        this.code = (code + 'return r.join("");').replace(/[\r\t\n]/g, ' ');

        // joint for bind
        // this.prehtml(this.joint({}))
    }
    joint(options, poi_id) {
        let result
        // result = new Function('obj', "with(obj){"+this.code+"}").apply(options, [options]);
        result = JsVm.safe(this.code, options);
        // result = JsVm.vm(this.code, deepClone(options));
        if(poi_id!=undefined){
            return afterJoint(result, poi_id)
        }else{
            return result;
        }
    }
}

module.exports = TemplateEngine;
