const JsVm = require("../util/JsVm.js");
const {
    deepClone
} = require("../util/util.js");

let afterJoint = (_html, poi_id) => {
    let re = /<([^/]+?)( [^<>]+)*>/g
    let tagArr = _html.match(re)
    for (let tag of tagArr) {
        re = /<([^/]+?)( [^<>]+)*>/g
        let option = re.exec(tag)[2]
        if (/([^<>]+):([^<>]+)=('|")[^<>]+?\3/g.test(option)) {
            _html = _html.replace(option, option + " PoiId=\"" + poi_id + "\"")
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
        if (poi_id != undefined) {
            return afterJoint(result, poi_id)
        } else {
            return result;
        }
    }
}

module.exports = TemplateEngine;
