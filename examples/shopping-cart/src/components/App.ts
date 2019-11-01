import { Poi } from '../../../../src/poi/poi';
import { h } from '../../../../src/tools/html';
import appTpl from "./AppTpl.html"

export default class App extends Poi {
    template(): string {
        return h(appTpl)
    }
    // created() {
    //     this["$global"].currency = "￥"
    // }
}

