import { ViewModel } from "./mvvm"
import { render, deepCloneVnode, childType } from "./vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "./vdom/any2v"
import { effect } from './reactivity/reactivity'
import { mergeReact } from "./reactivity/mergeReact"
// import { nextTickEffect } from './nxtTick';
// const effect = nextTickEffect
const reg = /\{\{(.*?)\}\}/g

function nodeToFragment(el: Node): DocumentFragment {
    const frag = document.createDocumentFragment()
    let child
    while (child = el.firstChild) {
        frag.appendChild(child)
    }
    return frag
}

function isElementNode(node: HTMLElement): boolean {
    return node.nodeType == 1
}

function isTextNode(node: HTMLElement): boolean {
    return node.nodeType == 3
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
        const attrName = attr.name
        if (attrName[0] == "_") {
            // directive
            // _{directive}:{args0}.{args1}={express}
            const dirArr = attrName.substring(1).split(":")
            const dirctiveName = dirArr[0]
            const argStr = dirArr[1] || ""
            const args = argStr.split(".")
            directives[dirctiveName] && directives[dirctiveName](node, vm, attr.value, args)
            node.removeAttribute(attrName)
            return
        }
        const flagIndex = attrName.indexOf(":")
        switch (flagIndex) {
            case attrName.length - 1:
                // {key}:={value} is link on the dom key
                const targetAttrName = attrName.substring(0, attrName.length - 1)
                if (bindMap[targetAttrName]) {
                    bindMap[targetAttrName](node, vm, attr.value)
                } else {
                    directives.bindCode(node, vm, attr.value, targetAttrName)
                }
                break
            case 0:
                // :{event}={target} is Event Directive
                const EventType = attrName.substring(1)
                eventHandler(node, vm, attr.value, EventType)
                break
            case -1:
                return // not is directive
            default:
            // nothing
        }
        node.removeAttribute(attrName)
        return
    });
}

function defaultUpdater(node: HTMLElement, value: any, key: string) {
    node[key] = value || ""
}

const updater = {
    text(node: HTMLElement, value: any) {
        node.textContent = value || ""
    },
    model(node: any, value: any) {
        node.value = value || ""
    },
    class(node: HTMLElement, value: string) {
        node.className = value
        // let className = node.className;
        // className = className.replace(className, '').replace(/\s$/, '');
        // let space = className && String(value) ? ' ' : '';
        // node.className = className + space + value;
    },
    html(node: HTMLElement, value: any) {
        let vnode = HTML2Vdom(value)
        render(vnode, node)
    },
    style(node: HTMLElement, value: string) {
        node.style.cssText = value
    }
}

function ctxCall(code: string): Function {
    return new Function("ctx", "with(ctx){return (" + code + ")}")
}

function eventHandler(node: HTMLElement, vm: ViewModel, exp: string, eventType: string) {
    let fn = vm.$data[exp]
    if (eventType && fn && typeof fn == "function") {
        node.addEventListener(eventType, fn.bind(vm.$data), false)
    }
}

const directives = {
    bindCode(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir]
        if (!updaterFunc) updaterFunc = defaultUpdater

        const ctxRenderValue = ctxCall(exp)
        const renderValue = () => ctxRenderValue(vm.$data)

        if (vm.$options.disposable)
            updaterFunc(node, renderValue())
        else
            effect(() => updaterFunc(node, renderValue(), dir))
    },
    bindv(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir]
        if (!updaterFunc) updaterFunc = defaultUpdater

        const ctxCalls = new Map<string, Function>()
        const renderValue = () => exp.replace(reg, (_, exp) => {
            let ctxCaller = ctxCalls.get(exp)
            if (ctxCaller) return ctxCaller(vm.$data)
            ctxCaller = ctxCall(exp)
            ctxCalls.set(exp, ctxCaller)
            return ctxCaller(vm.$data)
        })


        if (vm.$options.disposable)
            updaterFunc(node, renderValue(), dir)
        else
            effect(() => updaterFunc(node, renderValue(), dir))
    },
    bind(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir]
        if (!updaterFunc) updaterFunc = defaultUpdater

        if (vm.$options.disposable)
            updaterFunc(node, vm._get(exp), dir)
        else
            effect(() => updaterFunc(node, vm._get(exp), dir))
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

    },
    if(node: HTMLElement, vm: ViewModel, exp: string) {

    },
    for(node: HTMLElement, vm: ViewModel, exp: string) {
        const tplNode = node.cloneNode(true)
        const cloneNode = () => {
            const n = tplNode.cloneNode(true)
            if (n instanceof HTMLElement)
                n.removeAttribute("p-for")
            return n
        }
        let exprs = exp.match(/^((\w+,?)+) of (\w+)$/)
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
