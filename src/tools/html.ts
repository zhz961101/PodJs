import { compileHead } from '../compiler/compile';

const baseRe = "(\\S+)=(\\S+) ?"
const baseLongRe = "(\\S+)=([\"'])(\\S+)(?!\\\\)\\2 ?"
const eventRe = new RegExp("@" + baseRe, "g")
const eventLongRe = new RegExp("@" + baseLongRe, "g")
const bindRe = new RegExp("&" + baseRe, "g")
const bindLongRe = new RegExp("&" + baseLongRe, "g")
const directiveRe = new RegExp("\\$" + baseRe, "g")
const directiveLongRe = new RegExp("\\$" + baseLongRe, "g")
const directiveDefineRe = new RegExp(" \\$(\\S+) ?")

const eventProp = " " + compileHead + "event:$1=$2 "
const eventLongProp = " " + compileHead + "event:$1=$2$3$2 "
const bindProp = " " + compileHead + "bind:$1=$2 "
const bindLongProp = " " + compileHead + "bind:$1=$2$3$2 "
const directiveProp = " " + compileHead + "dir:$1=$2 "
const directiveLongProp = " " + compileHead + "dir:$1=$2$3$2 "
// const directiveDefineProp = " " + compileHead + "dir:$1 "

// const tagHeadReg = /<(?!\/)[\s\S]+?>/g

export function html(seqs: TemplateStringsArray, ...args: any[]): string {
    let htmlContent = passthru(seqs, ...args)
    htmlContent = htmlContent.replace(eventLongRe, eventLongProp).replace(eventRe, eventProp)
    htmlContent = htmlContent.replace(bindLongRe, bindLongProp).replace(bindRe, bindProp)
    htmlContent = htmlContent.replace(directiveLongRe, directiveLongProp).replace(directiveRe, directiveProp)
    // .replace(directiveDefineRe, directiveDefineProp)
    return htmlContent
}

function passthru(literals: TemplateStringsArray, ...args: any[]): string {
    let result = '';
    let i = 0;
    while (i < literals.length) {
        result += literals[i++];
        if (i - 1 < args.length) {
            result += args[i - 1];
        }
    }
    return result;
}
