const {callable} = require("../util/util")

module.exports = {
    creatCustomEle,
    tplLoader
}

/**
 * creat custom element
 * @param {String} tagName customEle tagname
 * @param {String} shadowHtml shadow inner html, include style and other
 * @param {Object} option Ele option{init,get xx,set xx...}
 * @param {Class} base defautl is HTMLElement
 */
function creatCustomEle(tagName, shadowHtml="", option, base=HTMLElement) {
    function thatEle(...args) {
        return Reflect.construct(base, [], this.constructor);
    }
    thatEle.prototype = Object.create(base.prototype);
    thatEle.prototype.constructor = thatEle;
    Object.setPrototypeOf(thatEle, base);
    thatEle.prototype.connectedCallback = function () {
        if(callable(option.init)){
            option.init.call(this)
        }
        this.shadowRoot = this.attachShadow({
            mode: 'open' // self-closing is hard to control
        });
        this.shadowRoot.innerHTML = shadowHtml
    }
    thatEle.prototype = Object.assign(thatEle.prototype, option)
    // registered
    window.customElements.define(tagName, thatEle)
}

function tplLoader(text) {
    let re = /<script[\s\S]*?>([\s\S]*?)<\/script>/i,
        script = text.match(re)[1],
        html = text.replace(re, ""),
        options = eval(`(function(){let options;${script}\nreturn options})()`)
    creatCustomEle(options.name, html, options)
}
