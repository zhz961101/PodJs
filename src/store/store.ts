// import { effect } from "../reactivity/reactivity"

interface EmitOptions {
    type: string
    [key: string]: any
}

export class Store {
    $actions: object // Map<string: Function>

    constructor(setup: Function) {
        this.$actions = setup()
    }

    emit(options: EmitOptions) {
        if (Object.keys(this.$actions).indexOf(options.type) === -1) {
            return
            // [TODO] throw error
        }
        delete options["type"]
        this.$actions[options.type](options)
    }

    dispatch(type: string, ...args: any[]) {
        if (Object.keys(this.$actions).indexOf(type) === -1) {
            return
            // [TODO] throw error
        }
        this.$actions[type](...args)
    }
}

