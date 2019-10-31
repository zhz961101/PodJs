import { randID } from "../tools/id"

// import { effect } from "../reactivity/reactivity"

interface EmitOptions {
    type: string
    [key: string]: any
}

interface SetupRet {
    [key: string]: Function
}

export class Store {
    $actions: object // Map<string: Function>
    $id: number

    constructor(setup: () => SetupRet) {
        this.$actions = setup()
        this.$id = randID()
    }

    emit(options: EmitOptions) {
        const type = options.type
        if (Object.keys(this.$actions).indexOf(type) === -1) {
            throw new TypeError(type, this)
        }
        delete options["type"]
        return this.$actions[type](options)
    }

    dispatch(type: string, ...args: any[]) {
        if (Object.keys(this.$actions).indexOf(type) === -1) {
            throw new TypeError(type, this)
        }
        return this.$actions[type](...args)
    }
}

class TypeError extends Error {
    constructor(typeName: string, store: Store) {
        super(`${typeName} is not defined on Store[$id:${store.$id}]`)
        this.name = "TypeError"
    }
}
