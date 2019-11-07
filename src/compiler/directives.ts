import { ViewModel } from "../mvvm/mvvm";
import { effect } from "../reactivity/reactivity";
import { mergeReact } from "../reactivity/wapper";
import { ctxCall } from "../utils";
import { Dom2Vnode } from "../vdom/any2v";
import { NodeContainer } from "../vdom/container";
import { VFragment } from "../vdom/frag";
import { Compile, compileHead, innerCodeRe } from "./compile";
import { defaultUpdater, updater } from "./updater";

export type DirectiveFunc = (node: Node, vm: ViewModel, exp: string, dir: string, args: string[]) => void;

export const bindMap = {
    text(node: Node, vm: ViewModel, exp: string) {
        directives.bindv(node, vm, exp, "text");
    },
};

export function defineDirective(name: string, func: DirectiveFunc) {
    directives[name] = func;
}

function getVm(node: any) {
    let vm = node.$vm;
    while (!vm) {
        node = node.parentNode;
        if (!node) { return; }
        vm = node.$vm;
    }
    return vm;
}

export function complieWithScope(el: Node, scope: object, supVm: ViewModel) {
    let data = mergeReact(scope, supVm.$data);
    let vm = new ViewModel(data, { manualCompile: true, disposable: true });
    let compiler = new Compile(vm, el);
    // manual GC
    vm = data = compiler = null;
}

export const directives = {
    bindCode(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir];
        if (!updaterFunc) { updaterFunc = defaultUpdater; }
        let oldValue = null;

        const ctxRenderValue = ctxCall(exp);
        const renderValue = () => ctxRenderValue(vm.$data);

        if (vm.$options.disposable) {
            updaterFunc(node, renderValue(), dir);
        } else {
            effect(() => {
                if (node.__destroy__) { return; }
                const newValue = renderValue();
                if (typeof newValue === "function" || newValue instanceof Function) {
                    getVm(node)._set("props." + dir, newValue);
                } else {
                    if (oldValue === newValue) { return; }
                    updaterFunc(node, newValue, dir, oldValue);
                    oldValue = newValue;
                }
            });
        }
    },
    bindv(node: Node, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir];
        if (!updaterFunc) { updaterFunc = defaultUpdater; }
        let oldValue = null;

        const ctxCalls = new Map<string, Function>(); // tslint:disable-line
        const renderValue = () => exp.replace(innerCodeRe, (_, expr) => {
            let ctxCaller = ctxCalls.get(expr);
            if (ctxCaller) {
                let fnret = ctxCaller(vm.$data);
                if (fnret === undefined || fnret === null) { fnret = ""; }
                return fnret;
            }
            // cache cant hit
            ctxCaller = ctxCall(expr);
            ctxCalls.set(expr, ctxCaller);
            let ret = ctxCaller(vm.$data);
            if (ret === undefined || ret === null) { ret = ""; }
            return ret;
        });

        if (vm.$options.disposable) {
            updaterFunc(node, renderValue(), dir);
        } else {
            effect(() => {
                const newValue = renderValue();
                updaterFunc(node, newValue, dir, oldValue);
                oldValue = newValue;
            });
        }
    },
    bind(node: HTMLElement, vm: ViewModel, exp: string, dir: string) {
        let updaterFunc = updater[dir];
        if (!updaterFunc) { updaterFunc = defaultUpdater; }
        let oldValue = null;

        if (vm.$options.disposable) {
            updaterFunc(node, vm._get(exp), dir);
        } else {
            effect(() => {
                const newValue = vm._get(exp);
                updaterFunc(node, newValue, dir, oldValue);
                oldValue = newValue;
            });
        }
    },
    model(node: any, vm: ViewModel, exp: string) {
        directives.bind(node, vm, exp, "model");

        let oldValue = node.value;
        const setter = vm.setter(exp);
        node.addEventListener("input", (ev) => {
            const newValue = ev.target.value;
            if (oldValue === newValue) { return; }
            setter(newValue);
            // vm[exp] = newValue
            oldValue = newValue;
        });
    },
    show(node: HTMLElement, vm: ViewModel, exp: string) {
        const updaterFunc = updater.show;

        const ctxRenderValue = ctxCall(exp);
        const renderValue = () => ctxRenderValue(vm.$data);

        if (vm.$options.disposable) {
            updaterFunc(node, renderValue());
        } else {
            effect(() => {
                if (node.__destroy__) { return; }
                updaterFunc(node, renderValue());
            });
        }
    },
    if(node: HTMLElement, vm: ViewModel, exp: string) {
        const ctxRenderValue = ctxCall(exp);
        const renderValue = () => ctxRenderValue(vm.$data);

        const vfrag = new VFragment(node);

        function updaterFunc() {
            if (renderValue()) {
                vfrag.patch([Dom2Vnode(node)]);
            } else {
                vfrag.patch([]);
            }
        }

        if (vm.$options.disposable) {
            updaterFunc();
        } else {
            effect(() => {
                if (node.__destroy__) { return; }
                updaterFunc();
            });
        }
    },
    for(node: HTMLElement, vm: ViewModel, exp: string) {
        node.removeAttribute("_for");
        node.removeAttribute(compileHead + "dir:for");
        const tplNode = node.cloneNode(true);
        const cloneNode = () => tplNode.cloneNode(true);
        const exprs = exp.match(/^((\w+,?)+) of (\S+)$/);
        const expArgsName: string[] = exprs[1].split(",");
        const target: string = exprs[3];

        const vfrag = new VFragment(node);
        // parentNode.removeChild(node)

        node.__destroy__ = true;
        node = null;

        if (vm.$options.disposable) {
            updaterFunc();
        } else {
            effect(() => updaterFunc());
        }

        function updaterFunc() {
            const newVal = vm._get(target);
            if (!Array.isArray(newVal)) { return; }
            const vnodes = newVal.map((...args) => {
                const ctxObj = Object.create(null);
                expArgsName.forEach((k, i) => ctxObj[k] = args[i]);
                const el = cloneNode();
                complieWithScope(el, ctxObj, vm);
                return Dom2Vnode(el);
            });
            vfrag.patch(vnodes);
        }
    },
};
