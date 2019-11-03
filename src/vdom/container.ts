
export interface Container {
    childNodes: Node[];
    replaceChild: (newChild: Node, oldChild: Node) => Node;
    insertBefore: (newChild: Node, refChild: Node) => Node;
    insertAfter: (newChild: Node, refChild: Node) => Node;
    appendChild: (newChild: Node) => Node;
    removeChild: (oldChild: Node) => Node;
}

export class NodeContainer {
    public $el: Node;

    constructor(el: Node) {
        this.$el = el;
    }
    get childNodes(): Node[] {
        return Array.from(this.$el.childNodes);
    }
    public replaceChild(newChild: Node, oldChild: Node): Node {
        return this.$el.replaceChild(newChild, oldChild);
    }
    public insertBefore(newChild: Node, refChild: Node): Node {
        return this.$el.insertBefore(newChild, refChild);
    }
    public insertAfter(newChild: Node, refChild: Node): Node {
        if (refChild.nextSibling) {
            return this.insertBefore(newChild, refChild.nextSibling);
        } else {
            return this.appendChild(newChild);
        }
    }
    public appendChild(newChild: Node): Node {
        return this.$el.appendChild(newChild);
    }
    public removeChild(oldChild: Node): Node {
        return this.$el.removeChild(oldChild);
    }
}
