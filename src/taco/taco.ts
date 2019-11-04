import { registerComponent } from "../compiler/compile";
import { ViewModel } from "../mvvm/mvvm";
import { h } from "../tools/html";
import { exclude, isType } from "../utils";

const isArray = isType("[object Array]");

declare global {
    interface Node {
        $vm: ViewModel;
    }
}

interface PropOption {
    type: any;
    default?: any;
    required?: boolean;
    validator: (valueL: any) => boolean;
    failed: () => void;
    passed: () => void;
}

export interface PropOptions {
    [key: string]: PropOption;
}

export interface Taco {
    props?: () => PropOptions;
    template: () => string | string[] | object;
    created?: () => void;
    setup: () => object;
    style?: () => string | string[] | object;
}

const tacoPrototypeKeys = ["props", "template", "created", "setup", "style"];

export function createApp(taco: Taco) {
    return {
        mount(el: HTMLElement) {
            mountInElement(el, taco);
        },
        component(tagName: string) {
            // only lower case
            registerComponent(tagName, (el: HTMLElement) => mountInElement(el, taco));
        },
    };
}

function mountInElement(el: HTMLElement, app: Taco) {
    const data = (app.setup && app.setup()) || {};
    const propertyData = exclude(app, tacoPrototypeKeys);
    const appData = Object.assign(data, propertyData);

    const props = (app.props && app.props()) || {};
    const observedAttributes = Object.keys(props);

    for (const attrName in props) {
        if (props.hasOwnProperty(attrName)) {
            const prop = props[attrName];
            if (prop.required && el.getAttribute(attrName) === null) {
                // 标记 required 但是没定义
                // tslint:disable-next-line
                console.warn(`the component need attrbute[${attrName}], but not define.`);
            }
        }
    }

    const shadow = el.attachShadow({ mode: "open" });
    const shadowHTML = h(app.template.call(appData).toString());
    let shadowStyle = "";
    if (app.style) {
        shadowStyle = loadStyleFromFunction(app.style.bind(appData));
    }
    shadow.innerHTML = shadowStyle + shadowHTML;
    const vm = new ViewModel(appData, { props, el: shadow });
    el.$vm = vm;

    // observer prop
    observerElementProps(el, observedAttributes, vm);
    // created
    if (app.created) {
        app.created.call(vm.$data);
    }
}

function observerElementProps(
    el: Node,
    observedAttributes: string[],
    vm: ViewModel,
) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && observedAttributes.indexOf(mutation.attributeName) !== -1) {
                const oldValue = mutation.oldValue;
                if (!(mutation.target instanceof HTMLElement)) { return; }
                const newValue = mutation.target.getAttribute(mutation.attributeName);
                attributeChangedCallback(mutation.attributeName, oldValue, newValue, vm);
            }
        });
    });
    observer.observe(el, {
        attributes: true,
    });
}

function attributeChangedCallback(
    prop: string,
    oldValue: any,
    newValue: any,
    vm: ViewModel,
) {
    const props = vm.$data.props;
    if (!props) { return; }
    if (oldValue === newValue) { return; }
    const defaulteValue = props[prop].default;
    const valueValidator = props[prop].validator;
    const failedHandler = props[prop].failed;
    const passedHandler = props[prop].passed;
    const value = newValue || defaulteValue;
    const parsedValue = (props[prop].type || String)(value);
    if (valueValidator) {
        if (valueValidator.call(vm.$data, parsedValue)) {
            if (passedHandler) {
                passedHandler.call(vm.$data, parsedValue);
            }
        } else {
            // 输出prop错误信息
            if (failedHandler) {
                failedHandler.call(vm.$data, parsedValue, value);
            }
        }
        vm.$data.props[prop] = value;
    } else {
        vm.$data.props[prop] = newValue;
    }
}

function loadStyleFromFunction(
    styleFunc: () => string | string[] | object,
): string {
    if (!styleFunc) {
        return "";
    }
    let retStyle = "";
    const styleResult = styleFunc();
    const styleArray: string[] = [];
    if (typeof styleResult === "string") {
        styleArray.push(styleResult);
    } else {
        if (styleResult instanceof Array) {
            if (styleResult.hasOwnProperty("toString")) {
                styleArray.push(styleResult.toString());
            } else {
                for (const sl of styleResult) {
                    styleArray.push(sl.toString());
                }
            }
        } else {
            throw new Error("Style function returned the wrong object, unable to parse and convert");
        }
    }
    for (const styleString of styleArray) {
        retStyle += "<style>" + styleString + "</style>";
    }
    return retStyle;
}
