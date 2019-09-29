
function DomAttrInfo(dom) {
    if (!dom || !dom.attributes) return [];
    return Array.from(dom.attributes).map(n => ({
        name: n.name || n.localName,
        value: n.value || n.nodeValue || n.textContent
    }))
}

const hasProp = (o, prop) => Object.getOwnPropertyNames(o).indexOf(prop) != -1;

function proxyBoth(o1, o2) {
    return new Proxy({}, {
        get(target, prop, receiver) {
            if (o1[prop] !== undefined) return o1[prop];
            if (o2[prop] !== undefined) return o2[prop];
            return Reflect.get(target, prop, receiver)
        },
        set(target, prop, value, receiver) {
            if (o1[prop] !== undefined) return o1[prop] = value;
            if (o2[prop] !== undefined) return o2[prop] = value;
            return Reflect.set(target, prop, value, receiver)
        },
        has(target, prop) {
            return o1[prop] !== undefined || o2[prop] !== undefined;
        }
    })
}

function bindEvent($dom, $poi, vm) {
    DomAttrInfo($dom).forEach(({
        name,
        value
    }) => {
        if (name[0] != "@") return;
        if ($dom.$binded) {
            if ($dom.$binded.indexOf(name) != -1) return;
        } else {
            $dom.$binded = [];
        }
        $dom.$binded.push(name);
        const proxyCtx = proxyBoth($poi.$data, {
            $dom
        });
        const callFunc = vm(value);
        $dom.addEventListener(name.slice(1), ev => {
            callFunc(proxyBoth(proxyCtx,{ev}));
        });
    })
}

function simpleVM(code) {
    return new Function("ctx", `with(ctx) {${code};}`);
}

module.exports = class PoiLisenter {
    renderAfter() {
        let $poi = this;
        (function callee(dom) {
            if (!dom) return;
            bindEvent(dom, $poi, simpleVM);
            Array.from(dom.children).forEach(d => callee(d));
        })(this.$);
    }
}
