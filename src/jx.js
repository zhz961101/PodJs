
const commentRegex = /<!--[\s\S]+?-->/g;
const clearComment = h => h.replace(commentRegex, "");

const JxUtils = {
    defalut: {
        regex: _ => /{{([\s\S]+?)}}/,
        jsvm: j => eval(j),
        actions: {
            "=": t => `yield ${t};`,
            "*": t => `yield* arguments.callee(${t});`,
        }
    }
}

function JxParser(conf){
    conf = conf || JxUtils.defalut;
    this.regex = conf.regex;
    this.jsvm = conf.jsvm;
    this.actions = conf.actions;
}

JxParser.prototype.appendAction = function(tag,func){
    this.actions[tag] = func;
}

JxParser.prototype.complie = function(JxHtml,ctx){
    const re = this.regex();
    let code = "",match,self=this;
    JxHtml = clearComment(JxHtml);

    function inner(jhtml) {
        if (jhtml.length == 0) return void(0);
        if (!(match = re.exec(jhtml)))
            code += `yield \`${jhtml}\`;`
        else {
            const cmd = match[1].split(" ");
            const actionTag = cmd[0].trim();
            const args = cmd.slice(1).join(" ").trim();
            // yield html text
            if (eval.index != 0)
                code += `yield \`${jhtml.slice(0,match.index)}\`;`
            // match action
            if (actionTag === "") {
                // js command
                code += args + "\n";
            } else if (self.actions.hasOwnProperty(actionTag)) {
                code += self.actions[actionTag](args,ctx);
            } else {
                // function wrapper
                code += `yield ${actionTag}(${args});`;
            }
            inner(jhtml.slice(match.index + match[0].length));
        }
    }
    inner(JxHtml);
    code = `(function*(obj){with(obj){\n${code}\n}})`;
    return (_ => data => this.jsvm(code)(data))();
}

module.exports = JxParser;
