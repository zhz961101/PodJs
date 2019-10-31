import { reactive, effect, computed, } from '../reactivity';

function nextCall(fn: Function): any {
    let que: Array<Function> = [fn]
    function nxt() {
        if (que.length == 0) return
        setTimeout(() => {
            que.shift()()
            nxt()
        }, 1);
    }
    nxt()
    return {
        next(fn: Function) {
            que.push(fn)
            return this
        }
    }
}

describe('reactivity/reactive', () => {

    test('Object', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        // get
        expect(observed.foo).toBe(1)
        // has
        expect('foo' in observed).toBe(true)
        // ownKeys
        expect(Object.keys(observed)).toEqual(['foo'])
    })

    test('cloned reactive Array should point to observed values', () => {
        const original = [{ foo: 1 }]
        const observed = reactive(original)
        const clone = observed.slice()
        expect(clone[0]).not.toBe(original[0])
        expect(clone[0]).toBe(observed[0])
    })
})

describe('effect function', () => {
    it("should run the passed function once (wrapped by a effect)", () => {
        const fnSpy = jest.fn(() => { })
        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    it('should observe basic properties', () => {
        let dummy
        const counter = reactive({ num: 0 })
        effect(() => (dummy = counter.num))

        expect(dummy).toBe(0)
        counter.num = 7
        nextCall(() => expect(dummy).toBe(7))
    })

    it('should observe delete operations', () => {
        let dummy
        const obj = reactive({ prop: 'value' })
        effect(() => (dummy = obj.prop))

        expect(dummy).toBe('value')
        delete obj.prop
        nextCall(() => expect(dummy).toBe(undefined))
    })

    it('should observe iteration', () => {
        let dummy
        const list = reactive(['Hello'])
        effect(() => (dummy = list.join(' ')))

        nextCall(() => expect(dummy).toBe('Hello'))
            .next(() => list.push('World!'))
            .next(() => expect(dummy).toBe('Hello World!'))
            .next(() => list.shift())
            .next(() => expect(dummy).toBe('Hello!'))
    })
})

describe("reactivity/computed", () => {
    it('should return updated value', () => {
        const value = reactive<{ foo?: number }>({})
        const cValue = computed(() => value.foo)
        expect(cValue.value).toBe(undefined)
        value.foo = 1
        nextCall(() => expect(cValue.value).toBe(1))
    })

    it('should compute lazily', () => {
        const value = reactive<{ foo?: number }>({})
        const getter = jest.fn(() => value.foo)
        const cValue = computed(getter)

        // lazy
        nextCall(() => expect(getter).not.toHaveBeenCalled())
            .next(() => expect(cValue.value).toBe(undefined))
            .next(() => expect(getter).toHaveBeenCalledTimes(1))
            // should not compute again
            .next(() => cValue.value)
            .next(() => expect(getter).toHaveBeenCalledTimes(1))
            // should not compute until needed
            .next(() => value.foo = 1)
            .next(() => expect(getter).toHaveBeenCalledTimes(1))
            // now it should compute
            .next(() => expect(cValue.value).toBe(1))
            .next(() => expect(getter).toHaveBeenCalledTimes(2))
            // should not compute again
            .next(() => cValue.value)
            .next(() => expect(getter).toHaveBeenCalledTimes(2))
    })
})
