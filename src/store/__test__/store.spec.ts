import { Store } from '../store';

describe("store/Store", () => {

    it("should be reported error, when a subscribe cannot be found", () => {
        let store = new Store(() => ({}))
        expect(() => store.dispatch("a"))
            .toThrow(`a is not defined on Store[$id:${store.$id}]`)
    })

    it("should remove type attribute when emit", () => {
        let store = new Store(() => ({
            action(options: any) {
                expect(options["type"]).toBe(undefined)
                expect(options["msg"]).toEqual("hello")
            }
        }))
        store.emit({
            type: "action",
            msg: "hello"
        })
    })

    it("should be support async function ", () => {
        let store = new Store(() => ({
            async action() {
                return "hello"
            }
        }))
        store.dispatch("action")
            .then(result => {
                expect(result).toEqual("hello")
            })
    })
})

