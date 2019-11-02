import { VFragment } from "../vdom/frag"
import { ViewModel } from "../mvvm/mvvm"
import { Dom2Vnode } from "../vdom/any2v"
import { complieWithScope } from "./directives"
import { effect } from "../reactivity/reactivity"
import { Vnode } from "../vdom/vdom"
import { ctxCall } from "../utils"

const LogicStatus = {
    ELSEIF: false
}

let IFELSEstackTop = null

export const statements = {
    skip(node: Node) {
        node.parentNode.removeChild(node)
    },
    // <for value i of values>
    // </for>
    for(node: Node, vm: ViewModel) {
        if (!(node instanceof HTMLElement)) return
        const attrs = Array.from(node.attributes).map(attr => attr.name)
        if (attrs.length < 3) {
            throw new Error(`Expected least 3 arguments, but got ${attrs.length}.`)
        }
        if (attrs.indexOf("of") < 1) {
            throw new Error(`Cannot resolve parameter name from [${attrs}]`)
        }
        const ofIdx = attrs.indexOf("of")
        const argsName = attrs.slice(0, ofIdx)
        const expr = attrs[ofIdx + 1]
        const vfrag = new VFragment(node)

        const tplNodes: Array<Node> = Array.from(node.childNodes).map(child => node.removeChild(child));

        // GC
        node = null

        if (vm.$options.disposable)
            updaterFunc()
        else
            effect(() => updaterFunc())

        function updaterFunc() {
            const newVal = vm._get(expr)
            if (!Array.isArray(newVal)) return
            const vnodes = []
            newVal.forEach((...args) => {
                let ctxObj = Object.create(null)
                argsName.forEach((k, i) => ctxObj[k] = args[i])
                for (const n of tplNodes) {
                    const el = n.cloneNode(true)
                    complieWithScope(el, ctxObj, vm)
                    vnodes.push(Dom2Vnode(el))
                }
            })
            vfrag.patch(vnodes)
        }
    },
    // <each values as value i>
    each(node: Node) {
        const frag = new VFragment(node)

    },
    // <if :="state.count%4==0">
    if(node: Node, vm: ViewModel) {
        if (!(node instanceof HTMLElement)) return
        if (node.attributes.length == 0) {
            throw new Error("IF statement need argument, but got 0.")
        }
        const expr = node.attributes[0].value
        if (expr.trim().length == 0) {
            throw new Error("IF statement need argument, but got empty string.")
        }
        const vfrag = new VFragment(node)
        const innerVNodes: Array<Vnode> = Array.from(node.childNodes).map(n => node.removeChild(n)).map(n => Dom2Vnode(n))

        // GC
        node = null
        const ctxRenderValue = ctxCall(expr)
        const renderValue = () => ctxRenderValue(vm.$data)

        let elseEffect: Function = null
        function elseEffectSetter(cb: Function) {
            elseEffect = cb
        }

        let inited = false

        if (vm.$options.disposable)
            updaterFunc()
        else
            effect(() => updaterFunc())
        function updaterFunc() {
            if (!inited) {
                IFELSEstackTop = elseEffectSetter
                inited = true
            }
            const newVal = renderValue()
            if (newVal) {
                vfrag.patch(innerVNodes)
                if (inited) {
                    elseEffect && elseEffect(true)
                }
                LogicStatus.ELSEIF = true
            } else {
                vfrag.patch([])
                if (inited) {
                    elseEffect && elseEffect(false)
                }
                LogicStatus.ELSEIF = false
            }
        }
    },
    // <elif :="state.count%2==0">
    elif(node: Node, vm: ViewModel) {
        if (!(node instanceof HTMLElement)) return
        if (node.attributes.length == 0) {
            throw new Error("ELSE-IF statement need argument, but got 0.")
        }
        const expr = node.attributes[0].value

        if (expr.trim().length == 0) {
            throw new Error("ELSE-IF statement need argument, but got empty string.")
        }
        const vfrag = new VFragment(node)
        const innerVNodes: Array<Vnode> = Array.from(node.childNodes).map(n => node.removeChild(n)).map(n => Dom2Vnode(n))

        // GC
        node = null
        const ctxRenderValue = ctxCall(expr)
        const renderValue = () => ctxRenderValue(vm.$data)

        let elseEffect: Function = null
        function elseEffectSetter(cb: Function) {
            elseEffect = cb
        }

        let inited = false

        updaterFunc(false)

        function updaterFunc(upperState: boolean) {
            if (!inited) {
                inited = true
                if (!IFELSEstackTop) {
                    throw new Error("need IF statement")
                }
                IFELSEstackTop(updaterFunc)
                IFELSEstackTop = elseEffectSetter
                if (!LogicStatus.ELSEIF) {
                    if (renderValue()) {
                        vfrag.patch(innerVNodes)
                        LogicStatus.ELSEIF = true
                    } else {
                        vfrag.patch([])
                        LogicStatus.ELSEIF = false
                    }
                } else {
                    vfrag.patch([])
                }
                return
            }
            if (!upperState) {
                if (renderValue()) {
                    vfrag.patch(innerVNodes)
                    elseEffect && elseEffect(true)
                } else {
                    vfrag.patch([])
                    elseEffect && elseEffect(false)
                }
            } else {
                vfrag.patch([])
                elseEffect && elseEffect(true)
            }
        }
    },
    // <else>
    else(node: Node, vm: ViewModel) {
        const vfrag = new VFragment(node)
        const innerVNodes: Array<Vnode> = Array.from(node.childNodes).map(n => node.removeChild(n)).map(n => Dom2Vnode(n))

        // GC
        node = null

        updaterFunc(false)

        if (IFELSEstackTop) {
            IFELSEstackTop(updaterFunc)
            IFELSEstackTop = null
        }
        function updaterFunc(upperState: boolean) {
            if (!upperState) {
                vfrag.patch(innerVNodes)
            } else {
                vfrag.patch([])
            }
        }
    },
    // <switch :="state.age" as age>
    switch(node: Node) {
        node.parentNode.removeChild(node)

    },
    // <case>
    case(node: Node) {
        node.parentNode.removeChild(node)

    },
    // <caif :="age < 10">
    caif(node: Node) {
        node.parentNode.removeChild(node)

    },
    // <default>
    default(node: Node) {
        node.parentNode.removeChild(node)

    },
    // <keep-alive include="" exclude="">
    ["keep-alive"](node: Node) {

    }
}