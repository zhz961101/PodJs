
const arrDiffer = (a, b) => {
    // if the other array is a falsy value, return
    if (!a || !b)
        return false
    // compare lengths - can save a lot of time
    if (a.length != b.length)
        return false
    let isIn = (arr1, arr2) => {
        for (let i in arr1) {
            let nullInOther = true
            for (let j in arr2) {
                if (arr1[i] == arr2[j]) {
                    nullInOther = false
                }
            }
            if (nullInOther) {
                return false
            }
        }
        return true
    }
    return isIn(a, b) && isIn(b, a)
}

function childIndex(ele){
    if(ele.cellIndex)return ele.cellIndex
    if(ele.rowIndex)return ele.rowIndex
    // if(ele.sourceIndex)return ele.sourceIndex

    // const toArr = o => Array.prototype.slice.call(o)
    // return toArr(ele.parentNode.children).indexOf(ele)
    
    // LoseIndex => diff.js(patch)
    if(!ele.parentNode.loseIndex){
        if(ele.previousElementSibling && ele.previousElementSibling.childIndex){
            ele.childIndex = ele.previousElementSibling.childIndex + 1
            return ele.childIndex
        }
        if(ele.nextElementSibling && ele.nextElementSibling.childIndex){
            ele.childIndex = ele.nextElementSibling.childIndex - 1
            return ele.childIndex
        }
        if(ele.childIndex)return ele.childIndex
    }
    //*** Performance killer
    let count = 0,
    node = ele.parentNode.children[0],
    ret = 0
    if(node == ele)return count
    while(node = node.nextElementSibling){
        node.childIndex = count
        if(node == ele)ret = count
        count += 1
    }
    ele.parentNode.loseIndex = true
    return ret
}

export const domApi = {
    $: _selector => {
        let ele = document.querySelector(_selector)
        ele.html = function(_newHtml) {
            if (this.empty) {
                return ''
            }
            if (_newHtml != undefined) {
                this.innerHTML = _newHtml;
                return _newHtml;
            } else {
                return this.innerHTML;
            }
        };
        return ele
    },
    createDom: _html => {
        let tempRoot = document.createElement("div")
        tempRoot.innerHTML = _html
        return tempRoot.children[0]
    },
    createDomTree: _html => {
        let tempRoot = document.createElement("div")
        tempRoot.innerHTML = _html
        return tempRoot.childNodes
    },
    append: (newElement, targetElement) => {
        newElement = typeof newElement == typeof "" ? domApi.createDom(newElement) : newElement
        return targetElement.appendChild(newElement)
    },
    insertBefore: (newElement, targetElement) => {
        let parent = targetElement.parentNode
        newElement = typeof newElement == typeof "" ? domApi.createDom(newElement) : newElement
        return parent.insertBefore(newElement, targetElement)
    },
    insertAfter: (newElement, targetElement) => {
        var parent = targetElement.parentNode;
        if (parent.lastChild == targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling)
        }
    },
    remove: targetElement => {
        if (targetElement == undefined) return
        let parent = targetElement.parentNode
        if (parent == undefined) {
            targetElement = null
            return
        }
        parent.removeChild(targetElement)
    },
    isSame: (ele1, ele2) => {
        if (ele1 == undefined || ele2 == undefined) return false;
        if (ele1.nodeType != ele2.nodeType) return false;
        if (ele1.nodeType == 1) {
            // node
            return (
                ele1.nodeName == ele2.nodeName &&
                ele1.id == ele2.id &&
                ele1.innerHTML.trim() == ele2.innerHTML.trim()
                // && ele1.className == ele2.className
            )
        }
        if (ele1.nodeType == 3) {
            // text node
            return (
                // domApi.isSame(ele1.parentNode, ele2.parentNode) &&
                ele1.textContent == ele2.textContent
            )
        }
    },
    isSameLayerNode(ele1, ele2){
        return this.isSame(ele1, ele2)
                && (ele1.childIndex && ele2.childIndex  && !ele1.parentNode.loseIndex?
                    ele1.childIndex == ele2.childIndex :
                    childIndex(ele1) == childIndex(ele2))
    },
    classListDiff: (ele1, ele2) => {
        if (ele1.classList.length != ele2.classList.length) {
            return false
        }
        let cList2Arr = ele => {
            let res = []
            ele.classList.forEach(val => {
                res.push(val)
            })
            return res
        }
        return arrDiffer(cList2Arr(ele1), cList2Arr(ele2))
    },
    attributesDiff: (ele1, ele2) => {
        // *** bad idea! ***
        // if(ele1.attributes.length!=ele2.attributes.length){
        //     return false
        // }
        let attributes2Arr = ele => {
            let res = []
            let tempCur = 0
            let blacks = ["class"]
            while (true) {
                let curNode = ele.attributes[tempCur]
                if (curNode) {
                    if (/(.+?):.+?/g.test(curNode.name)) {
                        blacks.push(/(.+?):(.+)/g.exec(curNode.name)[2])
                        tempCur += 1
                        continue
                    }
                    if (blacks.indexOf(curNode.name) != -1) {
                        tempCur += 1
                        continue
                    }
                    res.push(curNode.nodeValue)
                } else {
                    break
                }
                tempCur += 1
            }
            return res
        }
        return arrDiffer(attributes2Arr(ele1), attributes2Arr(ele2))
    },
    // #901
    // Failed to execute 'setNamedItem' on 'NamedNodeMap':
    // The node provided is an attribute node that is alre-
    // ady an attribute of another Element; attribute node-
    // s must be explicitly cloned.
    //
    attributesClone: (ele, to) => {
        for (let attr of ele.attributes) {
            ele.attributes.removeNamedItem(attr.name)
        }
        for (let attr of to.attributes) {
            ele.attributes.setNamedItem(attr.cloneNode(true))
        }
    },
    Comparable: (ele1, ele2) => {
        if (ele1 == undefined || ele2 == undefined) return false;
        if (ele1.nodeType != ele2.nodeType) return false;
        if (ele1.nodeType == 3) return true;
        return (
            ele1.nodeName == ele2.nodeName &&
            ele1.id == ele2.id &&
            ele1.className == ele2.className
        )
    }
}
