import { TacoPlug } from "..";
import { TacoExports } from "../api";
import { Compile, componentFunc } from "../compiler/compile";
import { DirectiveFunc } from "../compiler/directives";
import { statementFunc } from "../compiler/statement";
import { reactive } from "../reactivity/reactivity";
import { PropOptions } from "../taco/taco";
import { randID } from "../utils";

export const __Global__ = reactive({}); // tslint:disable-line

interface VmOptions {
    manualCompile?: boolean;
    disposable?: boolean;
    props?: PropOptions;
    el?: Node;
    parent?: ViewModel;
}

interface MvvmEnv {
    parent: ViewModel;
    root: ViewModel;
}

export class ViewModel {
    public static $global = __Global__;
    public $data: any;
    public $compile: Compile;
    public $id: number;
    public $env: MvvmEnv;
    public $options: VmOptions;

    constructor(data: any, options: VmOptions = {}) {
        this.$id = randID();
        this.$data = Object.assign(data, { $global: __Global__ });
        if (data.init) { data.init.call(this.$data); }
        delete this.$data.init;
        if (options.props) {
            const props = {};
            for (const key in options.props) {
                if (options.props.hasOwnProperty(key)) {
                    props[key] = options.props[key].default || "";
                }
            }
            this.$data.props = reactive(props);
        }
        for (const k of Object.keys(this.$data)) {
            if (typeof this.$data[k] === "function") {
                this.$data[k] = this.$data[k].bind(this.$data);
            }
        }
        if (options.parent) {
            this.$env = {
                parent: options.parent,
                root: options.parent.$env.root,
            };
        } else {
            this.$env = {
                parent: null,
                root: this,
            };
        }
        this.$options = options;
        if (!options.manualCompile || !options.el) {
            this.$compile = new Compile(this, options.el);
        }
    }

    public Use(plug: TacoPlug) {
        const tools = Object.assign({}, TacoExports);
        tools.defineStatement = (name: string, func: statementFunc) => {
            this.$compile.defineStatement(name, func);
        };
        tools.defineDirective = (name: string, func: DirectiveFunc) => {
            this.$compile.defineDirective(name, func);
        };
        tools.defineComponent = (name: string, func: componentFunc) => {
            this.$compile.defineComponent(name, func);
        };
        plug.install(tools);
    }

    public _get(exp: string): any {
        const arr = exp.trim().split(".");
        let value = this.$data;
        try {
            arr.forEach((vexp) => value = value[vexp]);
        } catch {
            return void 0;
        }
        return value;
    }

    public getter(exp: string): () => any {
        const arr = exp.trim().split(".");
        return (): any => {
            let value = this.$data;
            try {
                arr.forEach((vexp) => value = value[vexp]);
            } catch {
                return void 0;
            }
            return value;
        };
    }

    public _set(exp: string, newValue: any) {
        let val = this.$data;
        const arr = exp.trim().split(".");
        try {
            arr.forEach((k, i) => {
                if (i < arr.length - 1) {
                    val = val[k];
                } else {
                    val[k] = newValue;
                }
            });
        } catch {
            return void 0;
        }
    }

    public setter(exp: string): (newValue: any) => void {
        const arr = exp.trim().split(".");
        return (newValue) => {
            let val = this.$data;
            try {
                arr.forEach((k, i) => {
                    if (i < arr.length - 1) {
                        val = val[k];
                    } else {
                        val[k] = newValue;
                    }
                });
            } catch {
                return void 0;
            }
        };
    }
}
