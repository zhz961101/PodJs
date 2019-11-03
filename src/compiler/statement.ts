import { ViewModel } from "../mvvm/mvvm";
import { effect } from "../reactivity/reactivity";
import { ctxCall, isEdge } from "../utils";
import { Dom2Vnode } from "../vdom/any2v";
import { VFragment } from "../vdom/frag";
import { Vnode } from "../vdom/vdom";
import { complieWithScope } from "./directives";

const LogicStatus = {
    ELSEIF: false,
};

let IFELSEstackTop = null;

export const statements = {
    skip(node: Node) {
        node.parentNode.removeChild(node);
    },
    // <for :="item,i of items">
    // </for>
    for(node: Node, vm: ViewModel) {
        if (!(node instanceof HTMLElement)) { return; }
        let attrs = Array.from(node.attributes);
        if (isEdge && attrs[0].name === "class") {
            attrs = attrs.slice(1);
        }
        if (attrs.length < 1) {
            throw new Error(`Expected least 3 arguments, but got ${attrs.length}.`);
        }

        const exprs = attrs[0].value.match(/^((\w+,?)+) of (\S+)$/);
        const expArgsName: string[] = exprs[1].split(",");
        const target: string = exprs[3];

        const vfrag = new VFragment(node);

        const tplNodes: Node[] = Array.from(node.childNodes).map((child) => node.removeChild(child));

        // GC
        node = null;

        if (vm.$options.disposable) {
            updaterFunc();
        } else {
            effect(() => updaterFunc());
        }

        function updaterFunc() {
            const newVal = vm._get(target);
            if (!Array.isArray(newVal)) { return; }
            const vnodes = [];
            newVal.forEach((...args) => {
                const ctxObj = Object.create(null);
                expArgsName.forEach((k, i) => ctxObj[k] = args[i]);
                for (const n of tplNodes) {
                    const el = n.cloneNode(true);
                    complieWithScope(el, ctxObj, vm);
                    vnodes.push(Dom2Vnode(el));
                }
            });
            vfrag.patch(vnodes);
        }
    },
    // <each :="items as item,i">
    each(node: Node) {
        const frag = new VFragment(node);

    },
    // <if :="state.count%4==0">
    if(node: Node, vm: ViewModel) {
        if (!(node instanceof HTMLElement)) { return; }
        let attrs = Array.from(node.attributes);
        if (isEdge && attrs[0].name === "class") {
            attrs = attrs.slice(1);
        }
        if (attrs.length === 0) {
            throw new Error("IF statement need argument, but got 0.");
        }
        const expr = attrs[0].value;
        if (expr.trim().length === 0) {
            throw new Error("IF statement need argument, but got empty string.");
        }
        const vfrag = new VFragment(node);
        const innerVNodes: Vnode[] = Array.from(node.childNodes)
            .map((n) => node.removeChild(n))
            .map((n) => Dom2Vnode(n));

        // GC
        node = null;
        const ctxRenderValue = ctxCall(expr);
        const renderValue = () => ctxRenderValue(vm.$data);

        let elseEffect: (ups: boolean) => void = null;
        function elseEffectSetter(cb: (ups: boolean) => void) {
            elseEffect = cb;
        }

        let inited = false;

        if (vm.$options.disposable) {
            updaterFunc();
        } else {
            effect(() => updaterFunc());
        }
        function updaterFunc() {
            if (!inited) {
                IFELSEstackTop = elseEffectSetter;
                inited = true;
            }
            const newVal = renderValue();
            if (newVal) {
                vfrag.patch(innerVNodes);
                if (inited) {
                    if (elseEffect) {
                        elseEffect(true);
                    }
                }
                LogicStatus.ELSEIF = true;
            } else {
                vfrag.patch([]);
                if (inited) {
                    if (elseEffect) {
                        elseEffect(false);
                    }
                }
                LogicStatus.ELSEIF = false;
            }
        }
    },
    // <elif :="state.count%2==0">
    elif(node: Node, vm: ViewModel) {
        if (!(node instanceof HTMLElement)) { return; }
        let attrs = Array.from(node.attributes);
        if (isEdge && attrs[0].name === "class") {
            attrs = attrs.slice(1);
        }
        if (attrs.length === 0) {
            throw new Error("ELSE-IF statement need argument, but got 0.");
        }
        const expr = attrs[0].value;

        if (expr.trim().length === 0) {
            throw new Error("ELSE-IF statement need argument, but got empty string.");
        }
        const vfrag = new VFragment(node);
        const innerVNodes: Vnode[] = Array.from(node.childNodes)
            .map((n) => node.removeChild(n))
            .map((n) => Dom2Vnode(n));

        // GC
        node = null;
        const ctxRenderValue = ctxCall(expr);
        const renderValue = () => ctxRenderValue(vm.$data);

        let elseEffect: (ups: boolean) => void = null;
        function elseEffectSetter(cb: (ups: boolean) => void) {
            elseEffect = cb;
        }

        let inited = false;

        updaterFunc(false);

        function updaterFunc(upperState: boolean) {
            if (!inited) {
                inited = true;
                if (!IFELSEstackTop) {
                    throw new Error("need IF statement");
                }
                IFELSEstackTop(updaterFunc);
                IFELSEstackTop = elseEffectSetter;
                if (!LogicStatus.ELSEIF) {
                    if (renderValue()) {
                        vfrag.patch(innerVNodes);
                        LogicStatus.ELSEIF = true;
                    } else {
                        vfrag.patch([]);
                        LogicStatus.ELSEIF = false;
                    }
                } else {
                    vfrag.patch([]);
                }
                return;
            }
            if (!upperState) {
                if (renderValue()) {
                    vfrag.patch(innerVNodes);
                    if (elseEffect) {
                        elseEffect(true);
                    }
                } else {
                    vfrag.patch([]);
                    if (elseEffect) {
                        elseEffect(false);
                    }
                }
            } else {
                vfrag.patch([]);
                if (elseEffect) {
                    elseEffect(true);
                }
            }
        }
    },
    // <else>
    else(node: Node, vm: ViewModel) {
        const vfrag = new VFragment(node);
        const innerVNodes: Vnode[] = Array.from(node.childNodes)
            .map((n) => node.removeChild(n))
            .map((n) => Dom2Vnode(n));

        // GC
        node = null;

        updaterFunc(false);

        if (IFELSEstackTop) {
            IFELSEstackTop(updaterFunc);
            IFELSEstackTop = null;
        }
        function updaterFunc(upperState: boolean) {
            if (!upperState) {
                vfrag.patch(innerVNodes);
            } else {
                vfrag.patch([]);
            }
        }
    },
    // <switch :="state.age" as age>
    switch(node: Node) {
        node.parentNode.removeChild(node);

    },
    // <case>
    case(node: Node) {
        node.parentNode.removeChild(node);

    },
    // <caif :="age < 10">
    caif(node: Node) {
        node.parentNode.removeChild(node);

    },
    // <default>
    default(node: Node) {
        node.parentNode.removeChild(node);

    },
    // <keep-alive include="" exclude="">
    ["keep-alive"](node: Node) {
        node.parentNode.removeChild(node);

    },
};
