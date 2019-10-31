import { Poi } from '../../../../src/component/create';
import { html } from '../../../../src/tools/html';
import appTpl from "./AppTpl.html"

export default class App extends Poi {
    constructor() {
        super("app-root")
    }
    template(): string {
        return html`${appTpl}`
    }
    // created() {
    //     this["$global"].currency = "￥"
    // }
}

