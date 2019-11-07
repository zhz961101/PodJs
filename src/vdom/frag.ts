
import { randID } from "../utils";
import { Container } from "./container";
import { childType, patchChildren, Vnode } from "./vdom";

export class VFragContainer implements Container {
    public frag: VFragment;

    constructor(frag: VFragment) {
        this.frag = frag;
    }
    get firstChild(): Node {
        const el: Node = this.frag.startMark;
        if (el.nextSibling === this.frag.endMark) {
            return null;
        }
        return el.nextSibling;
    }
    // 不包括游标的元素
    get childNodes(): Node[] {
        const nodes = new Array<Node>();
        let el: Node = this.frag.startMark;
        while (true) {
            el = el.nextSibling;
            if (el === this.frag.endMark) {
                break;
            }
            if (!el) { break; }
            nodes.push(el);
        }
        return nodes;
    }
    public replaceChild(newChild: Node, oldChild: Node): Node {
        return this.frag.parentNode.replaceChild(newChild, oldChild);
    }
    public insertBefore(newChild: Node, refChild: Node): Node {
        return this.frag.parentNode.insertBefore(newChild, refChild);
    }
    public insertAfter(newChild: Node, refChild: Node): Node {
        if (refChild.nextSibling) {
            return this.insertBefore(newChild, refChild.nextSibling);
        } else {
            return this.appendChild(newChild);
        }
    }
    public appendChild(newChild: Node): Node {
        return this.insertBefore(newChild, this.frag.endMark);
    }
    public removeChild(oldChild: Node): Node {
        return this.frag.parentNode.removeChild(oldChild);
    }
}

export class VFragment {
    public startMark: Comment;
    public endMark: Comment;
    public container: VFragContainer;
    public $id: number;
    private $vnodes: Vnode[];

    get parentNode(): Node {
        return this.startMark.parentNode || this.endMark.parentNode;
    }

    constructor(el: Node) {
        this.$vnodes = [];
        this.$id = randID();
        this.container = new VFragContainer(this);
        this.startMark = document.createComment(`mark:${this.$id}:start`);
        this.endMark = document.createComment(`mark:${this.$id}:end`);

        el.parentNode.insertBefore(this.startMark, el);
        el.parentNode.insertBefore(this.endMark, el);

        el.parentNode.removeChild(el);
    }
    // vnode patch
    public patch(nextChildren: Vnode[]) {
        const prevChildren = this.$vnodes;
        /* tslint:disable */
        const prevType = prevChildren.length === 0 ? childType.EMPTY : (prevChildren.length === 1 ? childType.SINGLE : childType.MULITPLE);
        const nextType = nextChildren.length === 0 ? childType.EMPTY : (nextChildren.length === 1 ? childType.SINGLE : childType.MULITPLE);
        /* tslint:enable */
        patchChildren(prevType, nextType, prevChildren, nextChildren, this.container);
        this.$vnodes = nextChildren;
    }
}
