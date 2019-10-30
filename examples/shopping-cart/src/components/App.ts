import { Poi } from '../../../../src/component/create';
import { html } from '../../../../src/html';
import appTpl from "./AppTpl.html"

export default class App extends Poi {
    constructor() {
        super("app-root")
    }
    template(): string {
        return html`${appTpl}`
    }
}

