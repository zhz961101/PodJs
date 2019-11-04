import { HTML2Vdom } from "../vdom/any2v";
import { render } from "../vdom/vdom";

export function defaultUpdater(node: HTMLElement, value: any, key: string) {
    if (key === "disabled") {
        if (!value) {
            node.removeAttribute(key);
        } else {
            node.setAttribute(key, "");
        }
    } else {
        node.setAttribute(key, value || "");
    }
}

export const updater = {
    value(node: HTMLElement, value: any) {
        if (node instanceof HTMLInputElement ||
            node instanceof HTMLTextAreaElement ||
            node instanceof HTMLSelectElement) {
            if (node.value !== value) {
                node.value = value;
            }
        } else {
            node.setAttribute("nodeValue", value);
            node.setAttribute("value", value);
        }
    },
    text(node: HTMLElement, value: any) {
        if (value === undefined || value === null) { value = ""; }
        node.textContent = value;
    },
    model(node: any, value: any) {
        if (value === undefined || value === null) { value = ""; }
        node.value = value;
    },
    class(node: HTMLElement, value: string, oldValue: string) {
        const className = node.className;
        if (oldValue && className.includes(oldValue)) {
            node.className = node.className.replace(oldValue, value);
            return;
        }
        node.className += " " + value;
    },
    html(node: HTMLElement, value: any) {
        const htmlhead = node.outerHTML.match(/<[^>]+?>/)[0];
        const vnode = HTML2Vdom(`${htmlhead}${value}</${node.localName}>`);
        render(vnode, node);
    },
    style(node: HTMLElement, value: string) {
        const cssArr = value.split(";").filter((v) => v.length);
        for (const cssStr of cssArr) {
            const m = cssStr.split(":");
            if (!m[1]) { continue; }
            node.style[m[0].trim()] = m[1].trim();
        }
    },
    show(node: HTMLElement, value: boolean) {
        node.style.display = value ? "" : "none";
    },
};
