const {rebuild} = require("./utils");

class PoiEle {
    named(tagName){
        const that = this;
        customElements.define(tagName, class extends HTMLElement {
            constructor() {
                super()
                const prototypeData = rebuild(that, ["props"]);
                let shadow = this.attachShadow({
                    mode: 'open'
                });
                this.poi = new Poi()
                Object.assign(this.poi,prototypeData);
                this.poi.$ = shadow;
                this.poi.init()
            }
            static get observedAttributes() {
                return Object.keys(that.props);
            }
            attributeChangedCallback(prop, oldValue, newValue) {
                if (oldValue == newValue) return;
                const defaulteValue = that.props[prop].defalut,
                    valueValidator = that.props[prop].validator,
                    failedHandler = that.props[prop].failed,
                    passedHandler = that.props[prop].passed;
                const value = newValue || defaulteValue;
                const parsedValue = (that.props[prop].type || String)(value);
                if (valueValidator) {
                    if (valueValidator.call(this.poi.$data, parsedValue)) {
                        // this.poi.$data[prop] = value;
                        passedHandler && passedHandler.call(this.poi.$data, parsedValue);
                    } else {
                        // 输出prop错误信息
                        failedHandler && failedHandler.call(this.poi.$data, parsedValue, value);
                        // this.poi.$data[prop] = value;
                    }
                    this.poi.$data[prop] = value;
                } else {
                    this.poi.$data[prop] = newValue;
                }
                this.poi.render(["#shadowRoot", prop], [newValue], "%%attributeChangedCallback%%");
            }
        })
    }
}

module.exports = PoiEle;

