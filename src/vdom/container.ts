
export interface Container {
    childNodes: Array<Node>
    replaceChild: (newChild: Node, oldChild: Node) => Node
    insertBefore: (newChild: Node, refChild: Node) => Node
    insertAfter: (newChild: Node, refChild: Node) => Node
    appendChild: (newChild: Node) => Node
    removeChild: (oldChild: Node) => Node
}

export class NodeContainer {
    $el: Node

    constructor(el: Node) {
        this.$el = el
    }
    get childNodes(): Array<Node> {
        return Array.from(this.$el.childNodes)
    }
    replaceChild(newChild: Node, oldChild: Node): Node {
        return this.$el.replaceChild(newChild, oldChild)
    }
    insertBefore(newChild: Node, refChild: Node): Node {
        return this.$el.insertBefore(newChild, refChild)
    }
    insertAfter(newChild: Node, refChild: Node): Node {
        if (refChild.nextSibling) {
            return this.insertBefore(newChild, refChild.nextSibling)
        } else {
            return this.appendChild(newChild)
        }
    }
    appendChild(newChild: Node): Node {
        return this.$el.appendChild(newChild)
    }
    removeChild(oldChild: Node): Node {
        return this.$el.removeChild(oldChild)
    }
}
