import { compileHead } from '../../compiler/compile';
import { html } from '../html';

const attrNameReg = (name, type) => new RegExp(` +?${compileHead}${type}:${name}=\\S+?[ >]`)

describe("/tools/html", () => {

    test("should replace @event to be p-event:event", () => {
        const result = html`<ul @click='func1'></ul>`
        expect(
            attrNameReg("click", "event")
                .test(result)
        ).toBe(true)
    })

    test("should replace $dirname to be p-dir:dirname", () => {
        const result = html`<ul $show='canshow'></ul>`
        expect(
            attrNameReg("show", "dir")
                .test(result)
        ).toBe(true)
    })

    test("should replace &attr to be p-bind:attr", () => {
        const result = html`<ul &html='html'></ul>`
        expect(
            attrNameReg("html", "bind")
                .test(result)
        ).toBe(true)
    })

    test("should be able to accept alternate Template Strings", () => {
        const temp = "abcdefg"
        const result = html`${temp}`
        expect(result).toEqual(temp)
    })
})
