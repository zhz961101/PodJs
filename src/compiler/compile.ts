import { TacoPlug } from "..";
import { ViewModel } from "../mvvm/mvvm";
import { ctxCall, isEdge, isElementNode, isTextNode, nodeToFragment } from "../utils";
// import { Container, ContainerToFragmentElement, NodeContainer } from "../vdom/container";
import { bindMap, DirectiveFunc, directives } from "./directives";
import { statementFunc, statements } from "./statement";

declare global {
    interface Node {
        __destroy__?: boolean;
    }
}

export type componentFunc = (el: HTMLElement) => void;
const componentMap = new Map<string, componentFunc>();

export function defineComponent(tagName: string, func: componentFunc) {
    componentMap.set(tagName, func);
}

export const innerCodeRe = /\{\{(.*?)\}\}/g;

export const compileHead = "t-";
const eventAttrHead = compileHead + "event";
const bindAttrHead = compileHead + "bind";
const dirAttrHead = compileHead + "dir";
enum compileType {
    EVLISTENER,
    BINDATTR,
    DIRECTIVE,
    PLAIN,
    UNKNOW,
}

interface CompileInfo {
    type: compileType;
    name?: string;
    extra?: string;
}

function getCompileType(attrName: string): CompileInfo {
    if (attrName === ":") {
        return {
            type: compileType.PLAIN,
        };
    }
    if (!(attrName.includes(":") || attrName.includes("_"))) {
        return {
            type: compileType.PLAIN,
        };
    }
    const dirArr = attrName.split(":");
    // ==== event listener ====
    // p-event:click=func
    if (attrName.indexOf(eventAttrHead + ":") === 0) {
        return {
            type: compileType.EVLISTENER,
            name: dirArr[1],
        };
    }
    // :click=func
    if (attrName.indexOf(":") === 0) {
        return {
            type: compileType.EVLISTENER,
            name: dirArr[1],
        };
    }
    // ==== directive ====
    // p-dir:model=v2
    if (attrName.indexOf(dirAttrHead + ":") === 0) {
        return {
            type: compileType.DIRECTIVE,
            name: dirArr[1],
            extra: dirArr[2] || "",
        };
    }
    // _dir:arg1.arg2=o
    if (attrName.indexOf("_") === 0) {
        return {
            type: compileType.DIRECTIVE,
            name: dirArr[0].substring(1),
            extra: dirArr[1] || "",
        };
    }
    // ==== bind attr ====
    // p-bind:value=v1
    if (attrName.indexOf(bindAttrHead + ":") === 0) {
        return {
            type: compileType.BINDATTR,
            name: dirArr[1],
        };
    }
    // html:=h1
    if (attrName.indexOf(":") === attrName.length - 1) {
        return {
            type: compileType.BINDATTR,
            name: attrName.slice(0, attrName.length - 1),
        };
    }
    return {
        type: compileType.UNKNOW,
    };
}

export class Compile {
    public vm: ViewModel;
    public el: Node;
    private frag: DocumentFragment;

    private scopeDirectives: Map<string, DirectiveFunc>;
    private scopeStatements: Map<string, statementFunc>;
    private scopeComponents: Map<string, componentFunc>;

    constructor(vm: ViewModel, el: Node) {
        this.vm = vm;
        this.el = el;
        this.scopeDirectives = new Map<string, DirectiveFunc>();
        this.scopeStatements = new Map<string, statementFunc>();
        this.scopeComponents = new Map<string, componentFunc>();

        this.init();
    }

    public defineComponent(name: string, cb: componentFunc) {
        this.scopeComponents.set(name, cb);
    }
    public defineDirective(name: string, cb: DirectiveFunc) {
        this.scopeDirectives.set(name, cb);
    }
    public defineStatement(name: string, cb: statementFunc) {
        this.scopeStatements.set(name, cb);
    }

    private init() {
        if (this.el) {
            const el = this.el;
            if (el instanceof HTMLElement) {
                this.complie(el, this.vm);
            }
            if (el.nodeType === 1 || el.nodeType === 11) {
                this.frag = nodeToFragment(this.el);
                this.compileElement(this.frag);
                el.appendChild(this.frag);
            } else if (el.nodeType === 3) {
                this.complieText(el, el.textContent);
            }
        }
    }

    private compileElement(node: DocumentFragment) {
        const destroyed = node.__destroy__;
        if (destroyed) { return; }
        const childNodes = node.childNodes;
        Array().slice.call(childNodes).forEach((childNode) => {
            if (isElementNode(childNode)) {
                this.complie(childNode, this.vm);
            } else if (isTextNode(childNode) && innerCodeRe.test(childNode.textContent)) {
                // this.complieText(node, RegExp.$1.trim())
                this.complieText(childNode, childNode.textContent);
            }
            if (statements[childNode.localName]) {
                statements[childNode.localName](childNode, this.vm);
                return;
            } else if (this.scopeStatements.has(childNode.localName)) {
                this.scopeStatements.get(childNode.localName)(childNode, this.vm);
                return;
            }
            if (childNode.childNodes && childNode.childNodes.length) {
                const childDestroyed = childNode.__destroy__;
                if (childDestroyed) { return; }
                this.compileElement(childNode);
            }
        });
    }

    private complieText(node: Node, exp: string) {
        bindMap.text(node, this.vm, exp);
    }

    private complie(node: HTMLElement, vm: ViewModel) {
        if (componentMap.has(node.localName)) {
            // mount element
            componentMap.get(node.localName)(node);
        } else if (this.scopeComponents.has(node.localName)) {
            this.scopeComponents.get(node.localName)(node);
        }
        let nodeAttrs = Array.from(node.attributes);
        // 👇 IE 会莫名其妙的排序 attributes 列表，即使手动将指令放到第一个仍然会有问题，所以需要针对修改
        if (isEdge) {
            nodeAttrs = nodeAttrs.sort((a, _) => {
                if (a.name.indexOf("for") || a.name.indexOf("if")) {
                    return -1;
                }
                return 0;
            });
        }

        nodeAttrs.forEach((attr) => {
            // 👇 ts compiler optimizes in advance, so it needs to take out the value and judge again
            const destroyed = node.__destroy__;
            if (destroyed) {
                return;
            }
            const compileT = getCompileType(attr.name);
            switch (compileT.type) {
                case compileType.EVLISTENER:
                    eventHandler(node, vm, attr.value, compileT.name);
                    break;
                case compileType.BINDATTR:
                    if (bindMap[compileT.name]) {
                        bindMap[compileT.name](node, vm, attr.value);
                    } else {
                        directives.bindCode(node, vm, attr.value, compileT.name);
                    }
                    break;
                case compileType.DIRECTIVE:
                    const args = compileT.extra.split(".");
                    if (directives[compileT.name]) {
                        directives[compileT.name](node, vm, attr.value, compileT.name, args);
                    } else if (this.scopeDirectives.has(compileT.name)) {
                        this.scopeDirectives.get(compileT.name)(node, vm, attr.value, compileT.name, args);
                    }
                    break;
                case compileType.PLAIN:
                    return; // cant need compile
                case compileType.UNKNOW:
                    return; // [TODO] error!
                default:
                    return;
            }
            node.removeAttribute(attr.name);
            return;
        });
    }
}

function eventHandler(node: HTMLElement, vm: ViewModel, exp: string, eventType: string) {
    const ctxCaller = ctxCall(exp);
    function callback(event) {
        const fn = ctxCaller(vm.$data);
        if (fn && typeof fn === "function" || fn instanceof Function) {
            fn.call(vm.$data, event, event);
        }
    }
    if (eventType) {
        node.addEventListener(eventType, callback, false);
    }
}
