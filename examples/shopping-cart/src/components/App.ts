import { Poi } from '../../../../src/poi/poi';
import { html } from '../../../../src/tools/html';
import appTpl from "./AppTpl.html"

export default class App extends Poi {
    template(): string {
        return html`${appTpl}`
    }
    // created() {
    //     this["$global"].currency = "￥"
    // }
}

