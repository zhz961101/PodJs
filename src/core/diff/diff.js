const {
    domApi
} = require("../../domapi");

const {
    frameify
} = require('../util/frameify.js');

const {
    LCS,
    NullSeq
} = require("./lcs");

const {
    childClean,
    isSameTree,
    reload_pplan
} = require("./util")


let diffDomArr = async (newDomEles, oldDomEles, targetDom, INT_OBJ) => {
    let planArr = [];
    if (oldDomEles.length == 0) {
        for (let nEli in newDomEles) {
            planArr.push({
                option: "add",
                ele: newDomEles[nEli],
                upper: targetDom
            })
        }
        return planArr
    }
    if (newDomEles.length == 0) {
        for (let oEli in oldDomEles) {
            planArr.push({
                option: "delete",
                ele: oldDomEles[oEli]
            })
        }
        return planArr
    }
    let lcs = new LCS(newDomEles,oldDomEles, domApi.isSame, false)
    
    if(newDomEles.length * oldDomEles.length > 1024){
        // why 32?
        // O(nm) => O(32*32) => O(1024)
        // 即复杂度太高的就异步

        // 本来异步是一种一劳永逸的方法
        // 但是这里的异步层次太深，频繁切换状态容易被浏览器抢占
        // 比如paint（当页面中有可滚动或者hover动画时）往往会抢占帧并且无法返回（浏览器应该提供这种api接口）
        // 所以对于复杂度低的lcs矩阵这里则不会异步执行
        // （显而易见的，将co提到更搞一层是一种解决办法，至于为什么没有这么写，我会在 [features.md] 文件中继续谈）

        // in fact, asynchronous is a once-and-for-all way
        // But the code level here is too deep, and frequent switching task states are easily preempted by the browser.
        // For example, paint (when it have scrollable DOM or animation in the page) tends to preempt frames and cannot callback (the browser should provide this api interface)
        // So for lcs matrices with low complexity, it will not be executed asynchronously here.
        // (Obviously, it’s a solution to mention co as a layer(diffDomTree). As for why not, I will continue to talk in the [features.md] file)
        let _ = await frameify(lcs.genFillMat(), INT_OBJ)
        lcs = null;// GC
        if(_ == undefined)return planArr // []
    }else{
        lcs.fillMat()
    }
    // Interrupt Request
    // react的做法是通过throw一个非error对象，然后在最顶层捕获
    // 这里我没搞这么麻烦(机智)，就回复空return就行
    // 毕竟只是针对单一用例(只有rerender需要协程支持)
    let NonCommon = lcs.getTraceback(false)
    let Common = lcs.getTraceback(true)

    lcs = null;// GC

    const isEmpty_lcs = arr => arr.bufA.length == 0 && arr.bufB.length == 0

    if (isEmpty_lcs(NonCommon) && isEmpty_lcs(Common))return planArr // []

    // common part
    for (let index = 0; index < Common.bufA.length; index++) {
        const newEle = Common.bufA[index];
        const oldEle = Common.bufB[index];

        if(newEle.item.classList && !domApi.classListDiff(newEle.item, oldEle.item)){
            planArr.push({
                option: "classChange",
                ele: oldEle.item,
                target: newEle.item
            })
        }

        if(newEle.item.attributes && !domApi.attributesDiff(newEle.item, oldEle.item)){
            planArr.push({
                option: "attributesChange",
                ele: oldEle.item,
                target: newEle.item
            })
        }
    }

    // NonCommon part
    for (let index = 0; index < NonCommon.bufA.length; index++) {
        const newEle = NonCommon.bufA[index];
        const oldEle = NonCommon.bufB[index];

        if(newEle.item == NullSeq){
            planArr.push({
                option: "delete",
                ele: oldEle.item
            })
        }else if(oldEle.item == NullSeq){
            planArr.push({
                option: "add",
                ele: newEle.item,
                before: oldDomEles[oldEle.index],
                upper: targetDom
            })
        }else{
            if(isSameTree(oldEle.item,newEle.item))continue
            planArr.push({
                option: "delete",
                ele: oldEle.item
            })
            planArr.push({
                option: "add",
                ele: newEle.item,
                before: oldEle.item,
                upper: targetDom
            })
        }
    }
    return planArr
}

let diffDomtree = async (newChildren, oldTree, INT_OBJ) => {
    newChildren = childClean(newChildren)
    // ----
    let Nchi = [],
        Ochi = [],
        planArr = [],
        NsubTree = [],
        OsubTree = []
    for (let index in newChildren) {
        if (index == "length") break;
        let child = newChildren[index]
        if (child.nodeType == 3 && child.textContent.trim().replace(/\n/g, "") == "") continue;
        // if (child.childNodes.length == 0) {
        if (child.nodeType == 3 || child.children.length == 0) {
            Nchi.push(child)
        } else {
            NsubTree.push({
                before: newChildren[Number(index) - 1],
                ele: child,
                after: newChildren[Number(index) + 1],
            })
        }
    }
    for (let index in oldTree.childNodes) {
        if (index == "length") break;
        let child = oldTree.childNodes[index]
        if (child.nodeType == 3 && child.textContent.trim().replace(/\n/g, "") == "") continue;
        // if (child.childNodes.length == 0) {
        if (child.nodeType == 3 || child.children.length == 0) {
            let isgoto = false
            if (child.nodeType != 3) {
                for (let _c of NsubTree) {
                    if (domApi.isSame(_c.ele, child)) {
                        OsubTree.push(child)
                        isgoto = true
                        break;
                    }
                }
            }
            if (isgoto) continue
            Ochi.push(child)
        } else {
            OsubTree.push(child)
        }
    }
    if (Ochi.length == 0 && OsubTree.length == 0) {
        for (let index in newChildren) {
            return newChildren.map(v=>({
                option: "add",
                ele: v,
                upper: oldTree
            }))
        }
    }

    let oldT = (()=>{
        let ret = []
        for (const e of oldTree.childNodes) {
            if(e.nodeType == 3 && e.nodeValue.trim() == "")
                continue
            ret.push(e)
        }
        return ret
    })()

    let plan = await diffDomArr(newChildren, oldT, oldTree, INT_OBJ)

    // 清除被diff了的树
    // 确认不相同的需要diff的树
    // 会移除NsubTree和OsubTree
    // 因为他们不需要更深层的diff了

    if (plan.length != 0) {
        planArr.push.apply(planArr, plan)
    }
    for (let ni in NsubTree) {
        let ntree = NsubTree[ni].ele
        for (let oi in OsubTree) {
            let otree = OsubTree[oi]
            if (isSameTree(ntree, otree)) {
                // compare
                if (ntree.classList != undefined) {
                    if (!domApi.classListDiff(ntree, otree))
                        planArr.push({
                            option: "classChange",
                            ele: otree,
                            target: ntree
                        })
                }
                // attributesDiff
                if (ntree.attributes != undefined) {
                    if (!domApi.attributesDiff(ntree, otree))
                        planArr.push({
                            option: "attributesChange",
                            ele: otree,
                            target: ntree
                        })
                }
                // diff ending
                if (planArr.length != 0) {
                    planArr.push.apply(planArr, await diffDomtree(ntree.childNodes, otree, INT_OBJ))
                } else {
                    planArr = await diffDomtree(ntree.childNodes, otree, INT_OBJ)
                }
                delete NsubTree[ni]
                delete OsubTree[oi]
                // NsubTree.splice(ni, 1)
                // OsubTree.splice(oi, 1)
                break
            }
        }
    }
    // -------------
    // 如果能回忆出这里为什么这么写，那么就彻底删除...
    // -------------
    // for (let ni in NsubTree) {
    //     if (NsubTree[ni]) {
    //         if (NsubTree[ni].ele.nodeType == 3 && NsubTree[ni].ele.textContent.trim().replace(/\n/g, "") == "") continue;
    //         planArr.push({
    //             option: "add",
    //             before: nodeForTree(NsubTree[ni].before, OsubTree),
    //             after: nodeForTree(NsubTree[ni].after, OsubTree),
    //             ele: NsubTree[ni].ele,
    //             upper: oldTree
    //         })
    //     }
    // }
    // for (let ni in OsubTree) {
    //     if (OsubTree[ni]) {
    //         planArr.push({
    //             option: "delete",
    //             ele: OsubTree[ni]
    //         })
    //     }
    // }

    return planArr
}

let patch = function* (plan) {
    function patch_on(oldDOM, newDOM) {
        if (oldDOM.nodeType == 3) {
            if (oldDOM.textContent != newDOM.textContent) oldDOM.textContent = newDOM.textContent
        } else {
            oldDOM.classList = newDOM.classList;
            domApi.attributesClone(oldDOM, newDOM);
            if (oldDOM.innerHTML.trim() != newDOM.innerHTML.trim()) oldDOM.innerHTML = newDOM.innerHTML;
        }
    }
    plan = reload_pplan(plan)
    for (let ch of plan) {
        yield void 0;
        switch (ch.option) {
            case "after":
                domApi.insertBefore(ch.ele, ch.after)
                ch.upper.loseIndex = true
                break;
            case "before":
                domApi.insertAfter(ch.ele, ch.before)
                ch.upper.loseIndex = true
                break;
            case "append":
                domApi.append(ch.ele, ch.upper)
                ch.upper.loseIndex = true
                break;
            case "delete":
                domApi.remove(ch.ele)
                break;
            case "classChange":
                ch.ele.classList = ch.target.classList
                break;
            case "attributesChange":
                domApi.attributesClone(ch.ele, ch.target)
                break;
            case "patch":
                patch_on(ch.old, ch.new)
                break;
            default:
                void 0;
        }
    }
}
let diff = async (targetDom, newHtml, INT_OBJ) => {
    let newTreeChilds = domApi.createDomTree(newHtml)
    let patchArr = await diffDomtree(newTreeChilds, targetDom, INT_OBJ)
    // dont int patch func
    if (INT_OBJ && INT_OBJ.wtever) return []
    await frameify(patch(patchArr), INT_OBJ)
    // patch(patchArr)
    return patchArr
}

module.exports = diff