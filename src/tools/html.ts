import { compileHead } from '../compiler/compile';

const re = /<(?!\/)([^>]+?)>/g

export class HTMLExtender {
    reMap: Array<[RegExp, string]>
    content: string
    cursor: number

    constructor() {
        this.reMap = new Array<[RegExp, string]>()
    }

    addAttrExtend(re: RegExp, tpl: string) {
        this.reMap.push([re, tpl])
    }

    getLoader() {
        return (html: string): string => this.load(html)
    }

    load(html: string): string {
        this.content = html
        return this.walkHTML()
    }

    tansAttrName(name: string): string {
        for (const kv of this.reMap) {
            const [re, tpl] = kv
            if (re.test(name)) {
                return name.replace(re, tpl)
            }
        }
        return name
    }

    walkHTML(): string {
        let result = ""
        // init regexp object
        re.lastIndex = 0
        // 👆 这是一个可读写变量，但是却自顾自的给自己赋值，👍
        let lastIndex = 0
        let match
        while (match = re.exec(this.content)) {
            if (match.index > lastIndex) {
                result += this.content.slice(lastIndex, match.index)
            }
            result += "<" + this.walkAttrs(match[1]) + ">"
            lastIndex = re.lastIndex
        }
        if (lastIndex < this.content.length) {
            result += this.content.slice(lastIndex)
        }
        return result
    }

    walkAttrs(tag: string) {
        let spaceIdx = tag.indexOf(" ")
        if (spaceIdx == -1) return tag
        let tagName = tag.slice(0, spaceIdx)
        let attrStr = tag.slice(spaceIdx + 1)
        let attrArr = this.deserialize(attrStr)
        let retAttrArr = []
        for (const attr of attrArr) {
            const { name, value } = attr
            const nxtName = this.tansAttrName(name)
            retAttrArr.push({ name: nxtName, value })
        }
        return `${tagName} ${retAttrArr.map(v => v.name + "=" + '"' + v.value + '"').join(" ")}`
    }

    deserialize(attrStr: string): Array<{ name: string, value?: string }> {
        let tuples = []
        this.cursor = 0
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor]
            if (/\s/.test(char)) {
                //pass
                this.cursor++
                continue
            } else {
                let tuple = this.walkTuple(attrStr)
                tuples.push(tuple)
            }
        }
        return tuples
    }

    walkTuple(attrStr: string): { name: string, value?: string } {
        let name = ""
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor]
            if (/\s/.test(char)) {
                if (name.length != 0) {
                    this.cursor++
                    return { name }
                }
                //pass
            } else if (char == "=") {
                this.cursor++
                break
            } else {
                name += char
            }
            this.cursor++
        }
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor]
            if (/\s/.test(char)) {
                //pass
                this.cursor++
                continue
            } else if (char == "'" || char == '"') {
                let val = this.walkString(attrStr)
                return { name, value: val }
            } else {
                let val = this.walkValue(attrStr)
                return { name, value: val }
            }
        }
        return { name }
    }

    walkString(attrStr: string): string {
        let res = "",
            stack = [attrStr[this.cursor++]]
        while (this.cursor < attrStr.length) {
            const char = attrStr[this.cursor]
            if (char == "'" || char == '"') {
                let top = stack[stack.length - 1]
                if (top == char) {
                    stack.pop()
                    if (stack.length == 0) {
                        break
                    }
                } else {
                    stack.push(char)
                }
            }
            res += char
            this.cursor++
        }
        this.cursor++
        return res
    }

    walkValue(attrStr: string): string {
        let spaceIdx = attrStr.indexOf(" ", this.cursor)
        if (spaceIdx == -1) spaceIdx = attrStr.length
        let res = attrStr.slice(this.cursor, spaceIdx)
        this.cursor += res.length
        return res
    }
}

const defaultExtender = new HTMLExtender()
defaultExtender.addAttrExtend(/\$(\S+)/, compileHead + "dir:$1")
defaultExtender.addAttrExtend(/\@(\S+)/, compileHead + "event:$1")
defaultExtender.addAttrExtend(/\&(\S+)/, compileHead + "bind:$1")

export const h = defaultExtender.getLoader()
