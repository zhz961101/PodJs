import { ViewModel } from "../mvvm/mvvm"
import { Compile } from "../compiler/compile";
import { exclude } from "../utils";

interface propOption {
    type: any
    default?: any
    required?: boolean
    validator: (valueL: any) => boolean
    failed: () => void
    passed: () => void
}

export interface propOptions {
    [key: string]: propOption
}

export class Poi {
    // props?: () => propOptions
    // template: () => string
    // created?: () => void
    // setup?: () => object

    constructor(tagNmae: string) {
        if (!this["template"]) {
            throw `cant find template funciton`
        }
        const mData = exclude(this, ["props", "template", "created", "setup"])
        const elemCls = createCustomElements(mData, this["setup"], this["created"], this["template"], this["props"])

        customElements.define(tagNmae, elemCls)
    }
}

function createCustomElements(mData: object, setup: Function, created: Function, template: Function, props: () => propOptions = null): any {
    // cache observed attributes
    const observedAttributes = Object.keys((props && props()) || {})
    return class extends HTMLElement {
        $vm: ViewModel
        constructor() {
            super()
            // For each element, its own data and prop should be independent and built in the constructor.
            const shadow = this.attachShadow({ mode: 'open' })
            const setupData = (setup && setup()) || {}
            this.$vm = new ViewModel(shadow, Object.assign(setupData, mData), {
                manualComple: true,
                props: (props && props()) || {}
            })
            shadow.innerHTML = template.call(this.$vm.$data)
            this.$vm.$compile = new Compile(this.$vm, shadow)
        }
        static get observedAttributes() {
            return observedAttributes;
        }
        connectedCallback() {
            created && created.call(this.$vm.$data)
        }
        attributeChangedCallback(prop, oldValue, newValue) {
            const props = this.$vm.$data["props"]
            if (!props) return
            if (oldValue == newValue) return;
            const defaulteValue = props[prop].default,
                valueValidator = props[prop].validator,
                failedHandler = props[prop].failed,
                passedHandler = props[prop].passed;
            const value = newValue || defaulteValue;
            const parsedValue = (props[prop].type || String)(value);
            if (valueValidator) {
                if (valueValidator.call(this.$vm.$data, parsedValue)) {
                    // this.poi.$data[prop] = value;
                    passedHandler && passedHandler.call(this.$vm.$data, parsedValue);
                } else {
                    // 输出prop错误信息
                    failedHandler && failedHandler.call(this.$vm.$data, parsedValue, value);
                    // this.$vm.$data[prop] = value;
                }
                this.$vm.$data["props"][prop] = value;
            } else {
                this.$vm.$data["props"][prop] = newValue;
            }
        }
    }
}

