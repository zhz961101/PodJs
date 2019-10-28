import { ViewModel } from "./mvvm"
import { render, deepCloneVnode, childType } from "./vdom/vdom"
import { HTML2Vdom, Dom2Vnode } from "./vdom/any2v"
import { effect } from './reactivity/reactivity'
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

function isDirctive(attr: string): boolean {
    return attr.indexOf('p-') == 0
}

function isEventDirective(attr: string): boolean {
    return attr.indexOf('on') == 0
}

function isLinkDirective(attr: string): boolean {
    return attr.indexOf('bind') == 0
}

function isModelDirective(attr: string): boolean {
    return attr.indexOf('model') == 0
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
        let childNodes = node.childNodes
        Array().slice.call(childNodes).forEach(node => {
            if (isElementNode(node)) {
                this.complie(node)
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
        compileUtil.text(node, this.vm, exp);
    }

    complie(node: HTMLElement) {
        let nodeAttrs = node.attributes
        Array().slice.call(nodeAttrs).forEach(attr => {
            let attrName = attr.name
            if (isDirctive(attrName)) {
                let exp = attr.value
                let dir = attrName.substring(2)
                if (isEventDirective(dir)) {
                    compileUtil.eventHandler(node, this.vm, exp, dir)
                } else if (isLinkDirective(dir)) {
                    let attr = dir.split(':')[1]
                    compileUtil[attr] && compileUtil[attr](node, this.vm, exp)
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.vm, exp)
                }

                node.removeAttribute(attrName)
                return
            }
        });
    }
}

const updater = {
    textUpdater(node: HTMLElement, value: any) {
        node.textContent = value || ""
    },
    modelUpdater(node: any, value: any) {
        node.value = value || ""
    },
    classUpdater(node: HTMLElement, value: string) {
        let className = node.className;
        className = className.replace(className, '').replace(/\s$/, '');
        let space = className && String(value) ? ' ' : '';
        node.className = className + space + value;
    },
    htmlUpdater(node: HTMLElement, value: any) {
        let vnode = HTML2Vdom(value)
        render(vnode, node)
    },
    valueUpdater(node: any, value: any) {
        node.value = value || ""
    }
}

function ctxCall(code: string): Function {
    return new Function("ctx", "with(ctx){return (" + code + ")}")
}

const compileUtil = {
    eventHandler(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let evenType = dir.split(":")[1]
        let fn = vm.$data[exp]
        if (evenType && fn && typeof fn == "function") {
            node.addEventListener(evenType, fn.bind(vm.$data), false)
        }
    },
    bindCode(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        const ctxRenderValue = ctxCall(exp)
        const renderValue = () => ctxRenderValue(vm.$data)
        let updaterFunc = updater[dir + "Updater"]

        if (vm.$options.disposable)
            updaterFunc(node, renderValue())
        else
            effect(() => updaterFunc(node, renderValue()))
    },
    bindv(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        const renderValue = () => exp.replace(reg, (_, exp) => vm._get(exp))
        let updaterFunc = updater[dir + "Updater"]

        if (vm.$options.disposable)
            updaterFunc(node, renderValue())
        else
            effect(() => updaterFunc(node, renderValue()))
    },
    bind(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir + "Updater"]
        if (vm.$options.disposable)
            updaterFunc(node, vm._get(exp))
        else
            effect(() => updaterFunc(node, vm._get(exp)))
    },
    html(node: HTMLElement, vm: ViewModel, exp: string) {
        this.bindCode(node, vm, exp, "html")
    },
    class(node: HTMLElement, vm: ViewModel, exp: string) {
        this.bindCode(node, vm, exp, "class")
    },
    value(node: HTMLElement, vm: ViewModel, exp: string) {
        this.bindCode(node, vm, exp, "value")
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
    text(node: HTMLElement, vm: ViewModel, exp: string) {
        this.bindv(node, vm, exp, "text")
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

        parentNode.removeChild(node)

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

function complieWithScope(el: Node, scope: object, supVm: ViewModel) {
    let vm = new ViewModel(el, scope, { manualComple: true, disposable: true })
    Object.setPrototypeOf(vm, supVm)
    let compiler = new Compile(vm, el)
    // manual GC
    vm = compiler = null
}
