import { ViewModel } from "../mvvm/mvvm"
import { ctxCall, nodeToFragment, isElementNode, isTextNode, isEdge } from "../utils"
import { bindMap, directives } from "./directives"
import { statements } from './statement';

type componentGenFunc = (el: HTMLElement) => void
const componentMap = new Map<string, componentGenFunc>()

export function registerComponent(tagName: string, func: componentGenFunc) {
    componentMap.set(tagName, func)
}

export const innerCodeRe = /\{\{(.*?)\}\}/g

export const compileHead = "p-"
const eventAttrHead = compileHead + "event"
const bindAttrHead = compileHead + "bind"
const dirAttrHead = compileHead + "dir"
enum compileType {
    EVLISTENER,
    BINDATTR,
    DIRECTIVE,
    PLAIN,
    UNKNOW
}

interface compileInfo {
    type: compileType
    name?: string
    extra?: string
}

function getCompileType(attrName: string): compileInfo {
    if (attrName === ":")
        return {
            type: compileType.PLAIN
        }
    if (!(attrName.includes(":") || attrName.includes("_")))
        return {
            type: compileType.PLAIN
        }
    const dirArr = attrName.split(":")
    // ==== event listener ====
    // p-event:click=func
    if (attrName.indexOf(eventAttrHead + ":") == 0)
        return {
            type: compileType.EVLISTENER,
            name: dirArr[1],
        }
    // :click=func
    if (attrName.indexOf(":") == 0)
        return {
            type: compileType.EVLISTENER,
            name: dirArr[1],
        }
    // ==== directive ====
    // p-dir:model=v2
    if (attrName.indexOf(dirAttrHead + ":") == 0)
        return {
            type: compileType.DIRECTIVE,
            name: dirArr[1],
            extra: dirArr[2] || "",
        }
    // _dir:arg1.arg2=o
    if (attrName.indexOf("_") == 0)
        return {
            type: compileType.DIRECTIVE,
            name: dirArr[0].substring(1),
            extra: dirArr[1] || ""
        }
    // ==== bind attr ====
    // p-bind:value=v1
    if (attrName.indexOf(bindAttrHead + ":") == 0)
        return {
            type: compileType.BINDATTR,
            name: dirArr[1]
        }
    // html:=h1
    if (attrName.indexOf(":") == attrName.length - 1)
        return {
            type: compileType.BINDATTR,
            name: attrName.slice(0, attrName.length - 1)
        }
    return {
        type: compileType.UNKNOW
    }
}

export class Compile {
    vm: ViewModel
    el: Node
    frag: DocumentFragment

    constructor(vm: ViewModel, el: Node) {
        this.vm = vm
        this.el = el
        if (this.el) {
            if (this.el.nodeType === 1 || this.el.nodeType === 11) {
                this.frag = nodeToFragment(this.el)
                this.init()
                this.el.appendChild(this.frag)
            } else if (this.el.nodeType === 3) {
                this.complieText(this.el, this.el.textContent)
            }
        }
    }

    init() {
        if (this.el instanceof HTMLElement)
            complie(this.el, this.vm)
        this.compileElement(this.frag);
    }

    compileElement(node: DocumentFragment) {
        const destroyed = node["__destroy__"]
        if (destroyed) return
        let childNodes = node.childNodes
        Array().slice.call(childNodes).forEach(node => {
            if (isElementNode(node)) {
                complie(node, this.vm)
            } else if (isTextNode(node) && innerCodeRe.test(node.textContent)) {
                // this.complieText(node, RegExp.$1.trim())
                this.complieText(node, node.textContent)
            }
            if (statements[node.localName]) {
                statements[node.localName](node, this.vm)
                return
            }
            if (node.childNodes && node.childNodes.length) {
                const destroyed = node["__destroy__"]
                if (destroyed) return
                this.compileElement(node)
            }
        });
    }

    complieText(node: Node, exp: string) {
        bindMap.text(node, this.vm, exp)
    }
}

function complie(node: HTMLElement, vm: ViewModel) {
    if (componentMap.has(node.localName)) {
        // mount element
        componentMap.get(node.localName)(node)
    }
    let nodeAttrs = Array.from(node.attributes)
    // 👇 IE 会莫名其妙的排序 attributes 列表，即使手动将指令放到第一个仍然会有问题，所以需要针对修改
    if (isEdge) {
        nodeAttrs = nodeAttrs.sort((a, _) => {
            if (a.name.indexOf("for") || a.name.indexOf("if")) {
                return -1
            }
            return 0
        })
    }

    nodeAttrs.forEach(attr => {
        // 👇 ts compiler optimizes in advance, so it needs to take out the value and judge again
        const destroyed = node["__destroy__"]
        if (destroyed) {
            return
        }
        const compileT = getCompileType(attr.name)
        switch (compileT.type) {
            case compileType.EVLISTENER:
                eventHandler(node, vm, attr.value, compileT.name)
                break
            case compileType.BINDATTR:
                if (bindMap[compileT.name]) {
                    debugger
                    bindMap[compileT.name](node, vm, attr.value)
                } else {
                    directives.bindCode(node, vm, attr.value, compileT.name)
                }
                break
            case compileType.DIRECTIVE:
                const args = compileT.extra.split(".")
                directives[compileT.name] && directives[compileT.name](node, vm, attr.value, args)
                break
            case compileType.PLAIN:
                return // cant need compile
            case compileType.UNKNOW:
                return // [TODO] error!
            default:
                return
        }
        node.removeAttribute(attr.name)
        return
    });
}

function eventHandler(node: HTMLElement, vm: ViewModel, exp: string, eventType: string) {
    const ctxCaller = ctxCall(exp)
    function callback(event) {
        let fn = ctxCaller(vm.$data)
        if (fn && typeof fn == "function" || fn instanceof Function) {
            fn.call(vm.$data, event, event)
        }
    }
    if (eventType) {
        node.addEventListener(eventType, callback, false)
    }
}

