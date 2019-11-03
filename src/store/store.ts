import { randID } from "../tools/id";

// import { effect } from "../reactivity/reactivity"

interface EmitOptions {
    type: string;
    [key: string]: any;
}

interface SetupRet {
    [key: string]: (...args: any[]) => any;
}

class TypeError extends Error {
    constructor(typeName: string, store: Store) {
        super(`${typeName} is not defined on Store[$id:${store.$id}]`);
        this.name = "TypeError";
    }
}

export class Store {
    public $actions: object; // Map<string: Function>
    public $id: number;

    constructor(setup: () => SetupRet) {
        this.$actions = setup();
        this.$id = randID();
    }

    public emit(options: EmitOptions) {
        const type = options.type;
        if (Object.keys(this.$actions).indexOf(type) === -1) {
            throw new TypeError(type, this);
        }
        delete options.type;
        return this.$actions[type](options);
    }

    public dispatch(type: string, ...args: any[]) {
        if (Object.keys(this.$actions).indexOf(type) === -1) {
            throw new TypeError(type, this);
        }
        return this.$actions[type](...args);
    }
}
