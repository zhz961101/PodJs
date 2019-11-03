import { compileHead } from "../../compiler/compile";
import { h, HTMLExtender } from "../html";

const attrNameReg = (name, type) => new RegExp(` +?${compileHead}${type}:${name}=\\S+?[ >]`);

describe("/tools/h", () => {

    test("should replace @event to be p-event:event", () => {
        const result = h(`<ul @click='func1'></ul>`);
        expect(
            attrNameReg("click", "event")
                .test(result),
        ).toBe(true);
    });

    test("should replace $dirname to be p-dir:dirname", () => {
        const result = h(`<ul $show='canshow'></ul>`);
        expect(
            attrNameReg("show", "dir")
                .test(result),
        ).toBe(true);
    });

    test("should replace &attr to be p-bind:attr", () => {
        const result = h(`<ul &html='html'></ul>`);
        expect(
            attrNameReg("html", "bind")
                .test(result),
        ).toBe(true);
    });

    test("should be able to accept alternate Template Strings", () => {
        const temp = "abcdefg";
        const result = h(temp);
        expect(result).toEqual(temp);
    });
});

describe("/tools/heml/HTMLExtender", () => {

    test("should support multiple characters as attribute names and properly deserialize", () => {
        const ext = new HTMLExtender();
        const result = ext.deserialize(`@a#b$c="hello" %d^e&f*="world"`);
        expect(result).toHaveLength(2);
        expect(result[0].name).toEqual("@a#b$c");
        expect(result[0].value).toEqual("hello");
        expect(result[1].name).toEqual("%d^e&f*");
        expect(result[1].value).toEqual("world");
    });

    test("should support assignment without quotes", () => {
        const ext = new HTMLExtender();
        const result = ext.deserialize(`id=1 key=12`);
        expect(result).toHaveLength(2);
        expect(result[0].name).toEqual("id");
        expect(result[0].value).toEqual("1");
        expect(result[1].name).toEqual("key");
        expect(result[1].value).toEqual("12");

    });

    test("should support multi-level quotes for attribute values", () => {
        // 其实不应该支持多层，对于字符串，转移符就够了
        const ext = new HTMLExtender();
        const result = ext.deserialize(`msg="id + '_' + name"`);
        expect(result).toHaveLength(1);
        expect(result[0].name).toEqual("msg");
        expect(result[0].value).toEqual("id + '_' + name");

    });

    test("应该支持转移符", () => {
        // cont support now
    });

    test("should support no attribute values", () => {
        const ext = new HTMLExtender();
        const result = ext.deserialize(`arg1 arg2 arg3`);
        expect(result).toHaveLength(3);

        expect(result[0].name).toEqual("arg1");
        expect(result[0].value).toBeUndefined();
        expect(result[1].name).toEqual("arg2");
        expect(result[1].value).toBeUndefined();
        expect(result[2].name).toEqual("arg3");
        expect(result[2].value).toBeUndefined();
    });
});
