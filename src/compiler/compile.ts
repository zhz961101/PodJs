import { ViewModel } from "../mvvm/mvvm"
import { render, deepCloneVnode, childType } from "../vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "../vdom/any2v"
import { effect } from '../reactivity/reactivity'
import { mergeReact } from "../reactivity/wapper"
import { ctxCall, nodeToFragment, isElementNode, isTextNode } from "../utils"

const reg = /\{\{(.*?)\}\}/g

export const compileHead = "p-"
const eventAttrHead = compileHead + "event"
const bindAttrHead = compileHead + "bind"
const dirAttrHead = compileHead + "dir"
const compileType = {
    EVLISTENER: "EVLISTENER",
    BINDATTR: "BINDATTR",
    DIRECTIVE: "DIRECTIVE",
    PLAIN: "PLAIN",
    UNKNOW: "UNKNOW"
}

interface compileInfo {
    type: string
    name?: string
    extra?: string
}

function getCompileType(attrName: string): compileInfo {
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
            this.frag = nodeToFragment(this.el)
            this.init()
            this.el.appendChild(this.frag)
        }
    }

    init() {
        if (this.el instanceof HTMLElement)
            complie(this.el, this.vm)
        this.compileElement(this.frag);
    }

    compileElement(node: DocumentFragment) {
        if (node["__destroy__"]) return
        let childNodes = node.childNodes
        Array().slice.call(childNodes).forEach(node => {
            if (isElementNode(node)) {
                complie(node, this.vm)
            } else if (isTextNode(node) && reg.test(node.textContent)) {
                // this.complieText(node, RegExp.$1.trim())
                this.complieText(node, node.textContent)
            }
            if (node.childNodes && node.childNodes.length) {
                if (node["__destroy__"]) return
                this.compileElement(node)
            }
        });
    }

    complieText(node: HTMLElement, exp: string) {
        bindMap.text(node, this.vm, exp)
    }
}

function complie(node: HTMLElement, vm: ViewModel) {
    let nodeAttrs = node.attributes
    Array().slice.call(nodeAttrs).forEach(attr => {
        const compileT = getCompileType(attr.name)
        switch (compileT.type) {
            case compileType.EVLISTENER:
                eventHandler(node, vm, attr.value, compileT.name)
                break
            case compileType.BINDATTR:
                if (bindMap[compileT.name]) {
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

function complieWithScope(el: Node, scope: object, supVm: ViewModel) {
    let data = mergeReact(scope, supVm.$data)
    let vm = new ViewModel(el, data, { manualComple: true, disposable: true })
    let compiler = new Compile(vm, el)
    // manual GC
    vm = data = compiler = null
}

export function difineDirective(name: string, func: Function) {
    directives[name] = func
}

function getVm(node: any) {
    let vm = node.$vm
    while (!vm) {
        node = node.parentNode
        if (!node) return
        vm = node.$vm
    }
    return vm
}

function defaultUpdater(node: HTMLElement, value: any, key: string) {
    if (key == "disabled") {
        if (!value) {
            node.removeAttribute(key)
        } else {
            node.setAttribute(key, "")
        }
    } else {
        node.setAttribute(key, value || "")
    }
}

function eventHandler(node: HTMLElement, vm: ViewModel, exp: string, eventType: string) {
    const ctxCaller = ctxCall(exp)
    function callback() {
        let fn = ctxCaller(vm.$data)
        if (fn && typeof fn == "function" || fn instanceof Function) {
            fn.call(vm.$data)
        }
    }
    if (eventType) {
        node.addEventListener(eventType, callback, false)
    }
}

const updater = {
    text(node: HTMLElement, value: any) {
        node.textContent = value || ""
    },
    model(node: any, value: any) {
        node.value = value || ""
    },
    class(node: HTMLElement, value: string, oldValue: string) {
        let className = node.className;
        if (oldValue && className.includes(oldValue)) {
            node.className = node.className.replace(oldValue, value)
            return
        }
        node.className += " " + value
    },
    html(node: HTMLElement, value: any) {
        let vnode = HTML2Vdom(value)
        render(vnode, node)
    },
    style(node: HTMLElement, value: string) {
        const cssArr = value.split(";")
        for (const cssStr of cssArr) {
            let m = cssStr.split(":")
            node.style[m[0].trim()] = m[1].trim()
        }
    },
    show(node: HTMLElement, value: boolean) {
        node.style.display = value ? "" : "none"
    }
}

const directives = {
    bindCode(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir]
        if (!updaterFunc) updaterFunc = defaultUpdater
        let oldValue = null

        const ctxRenderValue = ctxCall(exp)
        const renderValue = () => ctxRenderValue(vm.$data)

        if (vm.$options.disposable)
            updaterFunc(node, renderValue(), dir)
        else
            effect(() => {
                if (node["__destroy__"]) return
                const newValue = renderValue()
                if (typeof newValue == "function" || newValue instanceof Function) {
                    getVm(node)._set("props." + dir, newValue)
                } else {
                    updaterFunc(node, newValue, dir, oldValue)
                    oldValue = newValue
                }
            })
    },
    bindv(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir]
        if (!updaterFunc) updaterFunc = defaultUpdater
        let oldValue = null

        const ctxCalls = new Map<string, Function>()
        const renderValue = () => exp.replace(reg, (_, exp) => {
            let ctxCaller = ctxCalls.get(exp)
            if (ctxCaller) return ctxCaller(vm.$data) || ""
            // cache cant hit
            ctxCaller = ctxCall(exp)
            ctxCalls.set(exp, ctxCaller)
            return ctxCaller(vm.$data) || ""
        })


        if (vm.$options.disposable)
            updaterFunc(node, renderValue(), dir)
        else
            effect(() => {
                const newValue = renderValue()
                updaterFunc(node, newValue, dir, oldValue)
                oldValue = newValue
            })
    },
    bind(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir]
        if (!updaterFunc) updaterFunc = defaultUpdater
        let oldValue = null

        if (vm.$options.disposable)
            updaterFunc(node, vm._get(exp), dir)
        else
            effect(() => {
                const newValue = vm._get(exp)
                updaterFunc(node, newValue, dir, oldValue)
                oldValue = newValue
            })
    },
    model(node: any, vm: ViewModel, exp: string) {
        this.bind(node, vm, exp, 'model')

        let oldValue = node.value
        let setter = vm.setter(exp)
        node.addEventListener('input', ev => {
            let newValue = ev.target.value
            if (oldValue == newValue) return
            setter(newValue)
            // vm[exp] = newValue
            oldValue = newValue
        })
    },
    show(node: HTMLElement, vm: ViewModel, exp: string) {
        let updaterFunc = updater["show"]

        const ctxRenderValue = ctxCall(exp)
        const renderValue = () => ctxRenderValue(vm.$data)

        if (vm.$options.disposable)
            return
        else
            effect(() => {
                if (node["__destroy__"]) return
                updaterFunc(node, renderValue())
            })
    },
    if(node: HTMLElement, vm: ViewModel, exp: string) {

    },
    for(node: HTMLElement, vm: ViewModel, exp: string) {
        const tplNode = node.cloneNode(true)
        const cloneNode = () => {
            const n = tplNode.cloneNode(true)
            if (n instanceof HTMLElement) {
                n.removeAttribute("p-dir:for")
                n.removeAttribute("_for")
            }
            return n
        }
        let exprs = exp.match(/^((\w+,?)+) of (\S+)$/)
        let expArgsName: string[] = exprs[1].split(",")
        let target: string = exprs[3]
        const parentNode = node.parentNode
        const parentVnodeTpl = Dom2Vnode(parentNode)
        parentVnodeTpl.children = []

        node["__destroy__"] = true
        parentNode.removeChild(node)
        node = null

        if (vm.$options.disposable)
            updaterFunc()
        else
            effect(() => updaterFunc())

        function updaterFunc() {
            const newVal = vm._get(target)
            if (!Array.isArray(newVal)) return
            const vnodes = newVal.map((...args) => {
                let ctxObj = Object.create(null)
                expArgsName.forEach((k, i) => ctxObj[k] = args[i])
                const el = cloneNode()
                complieWithScope(el, ctxObj, vm)
                return Dom2Vnode(el)
            })
            const vnode = deepCloneVnode(parentVnodeTpl)
            vnode.children = vnodes
            switch (vnodes.length) {
                case 0:
                    vnode.childrenType = childType.EMPTY
                    break
                case 1:
                    vnode.childrenType = childType.SINGLE
                    break
                default:
                    vnode.childrenType = childType.MULITPLE
                    break
            }
            render(vnode, parentNode)
        }
    },
}

const bindMap = {
    text(node: HTMLElement, vm: ViewModel, exp: string) {
        directives.bindv(node, vm, exp, "text")
    },
}
