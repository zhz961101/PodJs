import { compileHead } from "../compiler/compile";

const tagStartRe = /<(?!\/)([^>]+?)>/g;

export class HTMLExtender {
    public reMap: Array<[RegExp, string]>;
    public content: string;
    public cursor: number;

    constructor() {
        this.reMap = new Array<[RegExp, string]>();
    }

    public addAttrExtend(nameRe: RegExp, tpl: string) {
        this.reMap.push([nameRe, tpl]);
    }

    public getLoader() {
        return (html: string): string => this.load(html);
    }

    public load(html: string): string {
        this.content = html;
        return this.walkHTML();
    }

    public tansAttrName(name: string): string {
        for (const kv of this.reMap) {
            const [re, tpl] = kv;
            if (re.test(name)) {
                return name.replace(re, tpl);
            }
        }
        return name;
    }

    public walkHTML(): string {
        let result = "";
        // init regexp object
        tagStartRe.lastIndex = 0;
        // 👆 这是一个可读写变量，但是却自顾自的给自己赋值，👍
        let lastIndex = 0;
        let match;
        while (true) {
            match = tagStartRe.exec(this.content);
            if (!match) {
                break;
            }
            if (match.index > lastIndex) {
                result += this.content.slice(lastIndex, match.index);
            }
            if (match[0].slice(0, 4) === "<!--" && match[0].slice(-3) === "-->") {
                result += match[0];
            } else {
                result += "<" + this.walkAttrs(match[1]) + ">";
            }
            lastIndex = tagStartRe.lastIndex;
        }
        if (lastIndex < this.content.length) {
            result += this.content.slice(lastIndex);
        }
        return result;
    }

    public walkAttrs(tag: string) {
        const spaceIdx = tag.indexOf(" ");
        if (spaceIdx === -1) { return tag; }
        const tagName = tag.slice(0, spaceIdx);
        const attrStr = tag.slice(spaceIdx + 1);
        const attrArr = this.deserialize(attrStr);
        const retAttrArr = [];
        for (const attr of attrArr) {
            const { name, value } = attr;
            const nxtName = this.tansAttrName(name);
            retAttrArr.push({ name: nxtName, value });
        }
        let retHTML = tagName + " ";
        retAttrArr.forEach((attr) => {
            retHTML += attr.name;
            if (attr.value !== undefined || attr.value !== null) {
                retHTML += "=";
                retHTML += '"' + attr.value + '"';
            }
            retHTML += " ";
        });
        return retHTML;
    }

    public deserialize(attrStr: string): Array<{ name: string, value?: string }> {
        const tuples = [];
        this.cursor = 0;
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor];
            if (/\s/.test(char)) {
                // pass
                this.cursor++;
                continue;
            } else {
                const tuple = this.walkTuple(attrStr);
                tuples.push(tuple);
            }
        }
        return tuples;
    }

    public walkTuple(attrStr: string): { name: string, value?: string } {
        let name = "";
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor];
            if (/\s/.test(char)) {
                if (name.length !== 0) {
                    this.cursor++;
                    return { name };
                }
                // pass
            } else if (char === "=") {
                this.cursor++;
                break;
            } else {
                name += char;
            }
            this.cursor++;
        }
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor];
            if (/\s/.test(char)) {
                // pass
                this.cursor++;
                continue;
            } else if (char === "'" || char === '"') {
                const val = this.walkString(attrStr);
                return { name, value: val };
            } else {
                const val = this.walkValue(attrStr);
                return { name, value: val };
            }
        }
        return { name };
    }

    public walkString(attrStr: string): string {
        let res = "";
        const stack = [attrStr[this.cursor++]];
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor];
            if (char === "'" || char === '"') {
                const top = stack[stack.length - 1];
                if (top === char) {
                    stack.pop();
                    if (stack.length === 0) {
                        break;
                    }
                } else {
                    stack.push(char);
                }
            }
            res += char;
            this.cursor++;
        }
        this.cursor++;
        return res;
    }

    public walkValue(attrStr: string): string {
        let spaceIdx = attrStr.indexOf(" ", this.cursor);
        if (spaceIdx === -1) { spaceIdx = attrStr.length; }
        const res = attrStr.slice(this.cursor, spaceIdx);
        this.cursor += res.length;
        return res;
    }
}

const defaultExtender = new HTMLExtender();
defaultExtender.addAttrExtend(/\$(\S+)/, compileHead + "dir:$1");
defaultExtender.addAttrExtend(/\@(\S+)/, compileHead + "event:$1");
defaultExtender.addAttrExtend(/\&(\S+)/, compileHead + "bind:$1");

// for IE edge
// <if :="..."> => <if arg="...">
defaultExtender.addAttrExtend(/^:$/, "exp");
// <div style:="style" > => <div p-bind:style="style">
defaultExtender.addAttrExtend(/(\S+):$/, compileHead + "bind:$1");
// <div :click="...""> => <div p-event:click="...">
defaultExtender.addAttrExtend(/^:(\S+)/, compileHead + "event:$1");

export const h = defaultExtender.getLoader();
