export { difineDirective } from "./compiler/directives";
export { effect, reactive, computed } from "./reactivity/reactivity";
export { createElement, render } from "./vdom/vdom";
export { Store } from "./store/store";
export { Taco, createApp } from "./taco/taco";
export { ViewModel, __Global__ } from "./mvvm/mvvm";
export { h, HTMLExtender } from "./tools/html";
export { defineStatement } from "./compiler/statement";
export { VFragment } from "./vdom/frag";

import { difineDirective } from "./compiler/directives";
import { effect, reactive, computed } from "./reactivity/reactivity";
import { createElement, render } from "./vdom/vdom";
import { Store } from "./store/store";
import { createApp } from "./taco/taco";
import { ViewModel, __Global__ } from "./mvvm/mvvm";
import { h, HTMLExtender } from "./tools/html";
import { defineStatement } from "./compiler/statement";
import { VFragment } from "./vdom/frag";

const TacoExports = {
    defineStatement,
    difineDirective,
    effect,
    reactive,
    computed,
    createElement,
    render,
    Store,
    createApp,
    ViewModel,
    __Global__,
    h,
    HTMLExtender,
    VFragment,
    Use
}

export default TacoExports;

export interface TacoPlug {
    install(taco: any): void
}

export function Use(plug: TacoPlug) {
    plug.install(TacoExports)
}
