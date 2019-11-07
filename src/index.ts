export { defineDirective } from "./compiler/directives";
export { effect, reactive, computed } from "./reactivity/reactivity";
export { createElement, render } from "./vdom/vdom";
export { Store } from "./store/store";
export { Taco, createApp } from "./taco/taco";
export { ViewModel, __Global__ } from "./mvvm/mvvm";
export { h, HTMLExtender } from "./tools/html";
export { defineStatement } from "./compiler/statement";
export { VFragment } from "./vdom/frag";

import { TacoExports } from "./api";

export default TacoExports;

export interface TacoPlug {
    install(taco: any): void;
}

export function Use(plug: TacoPlug) {
    plug.install(TacoExports);
}
