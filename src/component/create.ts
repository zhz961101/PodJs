import { ViewModel } from "../mvvm"

function exclude(obj: object, exclude: string[]): object {
    exclude = exclude || [];
    exclude.push("constructor", "__proto__")
    let ret = Object.create(null);
    for (const key in obj) {
        if (exclude.indexOf(key) != -1) continue;
        const value = obj[key];
        ret[key] = value
    }
    let proto = Object.getPrototypeOf(obj);
    Object.getOwnPropertyNames(proto).forEach(key => {
        if (exclude.indexOf(key) != -1) return;
        const value = obj[key];
        ret[key] = value
    })
    return ret;
}

interface propOption {
    type: any
    default?: any
    required?: boolean
    validator: (valueL: any) => boolean
    failed: () => void
    passed: () => void
}

interface propOptions {
    [key: string]: propOption
}

export class Poi {
    props: propOptions
    template: () => string
    created: () => void
    setup: () => object

    constructor(tagNmae: string) {
        if (!this.template) {
            throw `cant find template funciton`
        }
        if (!this.setup) {

        }
        const observedAttributes = this.props ? Object.keys(this.props) : []
        const data = (this.setup && this.setup()) || {}
        const mData = Object.assign(data, exclude(this, ["prop", "template", "created", "setup"]))
        const elemCls = createCustomElements(mData, this.created, observedAttributes, this.template)

        customElements.define(tagNmae, elemCls)
    }
}

function createCustomElements(data: object, created: Function, observedAttributes: string[], template: Function, props: propOptions = null): any {
    return class extends HTMLElement {
        $vm: ViewModel
        constructor() {
            super()
            const shadow = this.attachShadow({ mode: 'open' })
            shadow.innerHTML = template()
            this.$vm = new ViewModel(shadow, data)
        }
        static get observedAttributes() {
            return observedAttributes;
        }
        connectedCallback() {
            created.call(this.$vm.$data)
        }
        attributeChangedCallback(prop, oldValue, newValue) {
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
                this.$vm.$data[prop] = value;
            } else {
                this.$vm.$data[prop] = newValue;
            }
        }
    }
}
