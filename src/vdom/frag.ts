
import { Vnode, vnodeType, patchChildren, childType } from './vdom';
import { randID } from '../tools/id';
import { Dom2Vnode } from './any2v';


export class VFragContainer {
    frag: VFragment

    constructor(frag: VFragment) {
        this.frag = frag
    }
    // 不包括游标的元素
    get childNodes(): Array<Node> {
        const nodes = new Array<Node>()
        let el: Node = this.frag.startMark
        while (true) {
            el = el.nextSibling
            if (el == this.frag.endMark) {
                break
            }
            if (!el) break
            nodes.push(el)
        }
        return nodes
    }
    replaceChild(newChild: Node, oldChild: Node): Node {
        return this.frag.parentNode.replaceChild(newChild, oldChild)
    }
    insertBefore(newChild: Node, refChild: Node): Node {
        return this.frag.parentNode.insertBefore(newChild, refChild)
    }
    insertAfter(newChild: Node, refChild: Node): Node {
        if (refChild.nextSibling) {
            return this.insertBefore(newChild, refChild.nextSibling)
        } else {
            return this.appendChild(newChild)
        }
    }
    appendChild(newChild: Node): Node {
        return this.insertBefore(newChild, this.frag.endMark)
    }
    removeChild(oldChild: Node): Node {
        return this.frag.parentNode.removeChild(oldChild)
    }
}

export class VFragment {
    startMark: Comment
    endMark: Comment
    container: VFragContainer
    $id: number
    $vnodes: Vnode[]

    get parentNode(): Node {
        return this.startMark.parentNode || this.endMark.parentNode
    }

    constructor(el: Node) {
        this.$vnodes = []
        this.$id = randID()
        this.container = new VFragContainer(this)
        this.startMark = document.createComment(`mark:${this.$id}:start`)
        this.endMark = document.createComment(`mark:${this.$id}:end`)

        el.parentNode.insertBefore(this.startMark, el)
        el.parentNode.insertBefore(this.endMark, el)

        el.parentNode.removeChild(el)
    }
    // vnode patch
    patch(nextChildren: Vnode[]) {
        const prevChildren = this.$vnodes
        const prevType = prevChildren.length == 0 ? childType.EMPTY : (prevChildren.length == 1 ? childType.SINGLE : childType.MULITPLE)
        const nextType = nextChildren.length == 0 ? childType.EMPTY : (nextChildren.length == 1 ? childType.SINGLE : childType.MULITPLE)
        patchChildren(prevType, nextType, prevChildren, nextChildren, this.container)
        this.$vnodes = nextChildren
    }
}

