import { Poi } from '../../../../src/poi/poi';
import { h } from '../../../../src/tools/html';
import appTpl from "./AppTpl.html"

const _template = h(appTpl)

export default class App extends Poi {
    template(): string {
        return _template
    }
    // created() {
    //     this["$global"].currency = "￥"
    // }
}

