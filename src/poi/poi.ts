import { ViewModel } from "../mvvm/mvvm"
import { registerComponent } from "../compiler/compile";
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

class EmptyTemplateError extends Error {
    constructor() {
        super("template not define, or template get empty string")
        this.name = "EmptyTemplateError"
    }
}

export class Poi {
    // props?: () => propOptions
    // template: () => string
    // created?: () => void
    // setup?: () => object
    methods: object

    constructor() {
        if (!this["template"]) {
            throw new EmptyTemplateError()
        }
        this.methods = exclude(this, ["props", "template", "created", "setup"])
    }
}

export function createApp(poi: any) {
    return {
        mount(el: HTMLElement) {
            mountInElement(el, poi)
        },
        component(tagName: string) {
            // only lower case
            registerComponent(tagName, (el: HTMLElement) => mountInElement(el, poi))
        }
    }
}

function mountInElement(el: HTMLElement, poi: any) {
    const app = new poi()

    const data = (app.setup && app.setup()) || {}
    const mData = exclude(app, ["props", "template", "created", "setup", "methods"])

    const props = (app.props && app.props()) || {}
    const observedAttributes = Object.keys(props)

    for (const attrName in props) {
        if (props.hasOwnProperty(attrName)) {
            const prop = props[attrName];
            if (prop.required && el.getAttribute(attrName) === null) {
                // 标记 required 但是没定义
                console.warn(`the component need attrbute[${attrName}], but not define.`)
            }
        }
    }

    const shadow = el.attachShadow({ mode: "open" })
    shadow.innerHTML = app.template()
    const vm = new ViewModel(Object.assign(data, mData), { props, el: shadow })
    el["$vm"] = vm

    const observer = new MutationObserver(mutations => {
        mutations.forEach(function (mutation) {
            if (mutation.type == "attributes" && observedAttributes.indexOf(mutation.attributeName) != -1) {
                const oldValue = mutation.oldValue
                const newValue = mutation.target["getAttribute"](mutation.attributeName)
                attributeChangedCallback(mutation.attributeName, oldValue, newValue, vm)
            }
        })
    })
    observer.observe(el, {
        attributes: true
    })
    // created
    app.created && app.created.call(vm.$data)
}

function attributeChangedCallback(prop: string, oldValue: any, newValue: any, vm: ViewModel) {
    const props = vm.$data["props"]
    if (!props) return
    if (oldValue == newValue) return;
    const defaulteValue = props[prop].default,
        valueValidator = props[prop].validator,
        failedHandler = props[prop].failed,
        passedHandler = props[prop].passed;
    const value = newValue || defaulteValue;
    const parsedValue = (props[prop].type || String)(value);
    if (valueValidator) {
        if (valueValidator.call(vm.$data, parsedValue)) {
            // this.poi.$data[prop] = value;
            passedHandler && passedHandler.call(vm.$data, parsedValue);
        } else {
            // 输出prop错误信息
            failedHandler && failedHandler.call(vm.$data, parsedValue, value);
            // vm.$data[prop] = value;
        }
        vm.$data["props"][prop] = value;
    } else {
        vm.$data["props"][prop] = newValue;
    }
}
