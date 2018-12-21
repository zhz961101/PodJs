const {
    domApi
} = require("../util/domApi.js");

const {
    frameify
} = require('../util/frameify.js');

// const debugObj = require("../util/debug")
let _lcsDomArr = async (newDomEle, oldDomEle, targetDom, INT_OBJ) => {
    let planArr = [];
    if (oldDomEle.length == 0) {
        for (let nEli in newDomEle) {
            planArr.push({
                option: "add",
                ele: newDomEle[nEli],
                upper: targetDom
            })
        }
        return planArr
    }
    if (newDomEle.length == 0) {
        for (let oEli in oldDomEle) {
            planArr.push({
                option: "delete",
                ele: oldDomEle[oEli]
            })
        }
        return planArr
    }
    let lcs_arr = await frameify(lcsOnArr(newDomEle, oldDomEle, domApi.isSame), INT_OBJ),
        curA = 0,
        curB = 0;
    // Interrupt Request
    // react的做法是通过throw一个非error对象，然后在最顶层捕获
    // 这里我没搞这么麻烦(机智)，就回复空return就行
    // 毕竟只是针对单一用例(只有rerender需要协程支持)
    if (lcs_arr === undefined) return planArr

    while (true) {
        if (curA >= lcs_arr.length && curB >= lcs_arr[0].length) {
            break;
        }
        let nr = lcs_arr[curA + 1] ? lcs_arr[curA + 1] : [],
            cr = lcs_arr[curA] ? lcs_arr[curA] : [];
        let rv = cr[curB + 1] ? cr[curB + 1] : 0,
            bv = nr[curB] ? nr[curB] : 0,
            rbv = nr[curB + 1] ? nr[curB + 1] : 0,
            val = cr[curB];
        if (domApi.isSame(newDomEle[curA], oldDomEle[curB])) {
            // same char
            if (newDomEle[curA].classList != undefined) {
                if (!domApi.classListDiff(newDomEle[curA], oldDomEle[curB]))
                    planArr.push({
                        option: "classChange",
                        ele: oldDomEle[curB],
                        list: newDomEle[curA].classList
                    })
            }
            // attributesDiff
            if (newDomEle[curA].attributes != undefined) {
                if (!domApi.attributesDiff(newDomEle[curA], oldDomEle[curB]))
                    planArr.push({
                        option: "attributesChange",
                        ele: oldDomEle[curB],
                        to: newDomEle[curA]
                    })
            }
            curA += 1;
            curB += 1;
            continue;
        } else if (val == 0 && rbv != 1) {
            planArr.push({
                option: "add",
                before: oldDomEle[curB],
                after: oldDomEle[curB + 1],
                ele: newDomEle[curA],
                upper: targetDom
            })
            curA += 1;
            continue;
        } else if (rv == bv) {
            // ta+1"_" tb+1cahr

            // done  对于按相同tag的元素可以不用删了又加，添加一个新的动作patch
            //       用来改变原元素的属性，而不用重绘
            if (oldDomEle[curB] && newDomEle[curA] && oldDomEle[curB].nodeName == newDomEle[curA].nodeName) {
                planArr.push({
                    option: "patch",
                    old: oldDomEle[curB],
                    new: newDomEle[curA]
                })
                curA += 1;
                curB += 1;
                continue;
            }
            // 下面的是比如向末尾添加

            // #201 Matrix boundary
            if (newDomEle[curA] != undefined)
                planArr.push({
                    option: "add",
                    before: oldDomEle[curB],
                    after: oldDomEle[curB + 1],
                    ele: newDomEle[curA],
                    upper: targetDom
                })
            // *前后操作不能调换，对于末尾元素需要olddom来定位所以必须先add
            // 一些特殊的情况，大部分ele是没有的
            planArr.push({
                option: "delete",
                ele: oldDomEle[curB]
            })
            curA += 1;
            curB += 1;
            continue;
        } else if (rv > bv) {
            planArr.push({
                option: "delete",
                ele: oldDomEle[curB]
            })
            curB += 1;
            continue;
        } else {
            // tb+1"_" ta+1char
            planArr.push({
                option: "add",
                before: oldDomEle[curB],
                after: oldDomEle[curB + 1],
                ele: newDomEle[curA],
                upper: targetDom
            })
            curA += 1;
        }
    }
    return planArr
}
// #101 Time complexity: O(arr1.length * arr2.length)
let lcsOnArr = function* (arr1, arr2, compareFn) {
    let lcsArr = [];
    for (let indexA in arr1) {
        let rowArr = [],
            itemA = arr1[indexA];
        for (let indexB in arr2) {
            yield void 0;
            let itemB = arr2[indexB],
                lv = indexB == 0 ? 0 : rowArr[indexB - 1],
                tv = indexA == 0 ? 0 : lcsArr[indexA - 1][indexB],
                ltv = indexB != 0 && indexA != 0 ? lcsArr[indexA - 1][indexB - 1] : 0;
            if (compareFn(itemA, itemB)) {
                rowArr.push(ltv + 1);
            } else {
                rowArr.push(lv > tv ? lv : tv);
            }
        }
        lcsArr.push(rowArr);
    }
    return lcsArr;
}


function childClean(chs){
    const re = /^\s+$/
    let res = []
    for (const c of chs) {
        if(c.nodeType == 3 && re.test(c.data))continue
        else res.push(c)
    }
    return res
}

function nodeForTree(node,tree){
    if(!node)return undefined
    for (const c of tree.children) {
        if(domApi.isSame(c,node))return c
    }
    return node
}

let lcsDomtree = async (newChildren, oldTree, INT_OBJ) => {
    const toarr = o => Array.prototype.slice.call(o)
    const layer_num = ele => ele.parentNode?toarr(ele.parentNode.children).indexOf(ele):0
    let isSameTree = (ele1, ele2, is_super) => {
        // console.log(ele1, ele2, is_super)
        if (is_super && (!ele1 || !ele2)) return true;
        if(ele1.parentNode.parentNode == null && ele1.children.length > 0)return true;
        return (
            ele1.nodeName == ele2.nodeName
            && ele1.nodeType == ele2.nodeType
            && layer_num(ele1) == layer_num(ele2)
            // && (is_super ? true : ele1.id == ele2.id)
            // && (ele1.parentNode && ele2.parentNode ? isSameTree(ele1.parentNode, ele2.parentNode, true) : true)
            // && ele1.children.length == ele2.children.length
            // class并不作为对比关键
            // *改这里真的要给我改吐了，必须拥抱typescript!!!
            // && ele1.className == ele2.className
        )
    }

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
                before: newChildren[index-1],
                ele: child,
                after: newChildren[index+1],
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
        Nchi = []
        NsubTree = []
        for (let index in newChildren) {
            if (index == "length") break;
            let child = newChildren[index]
            if (child.nodeType == 3 && child.textContent.trim().replace(/\n/g, "") == "") continue;
            Nchi.push(child)
        }
    }
    // let plan = lcsDomArr(Nchi, Ochi, oldTree)
    let plan = await _lcsDomArr(Nchi, Ochi, oldTree, INT_OBJ)

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
                            list: ntree.classList
                        })
                }
                // attributesDiff
                if (ntree.attributes != undefined) {
                    if (!domApi.attributesDiff(ntree, otree))
                        planArr.push({
                            option: "attributesChange",
                            ele: otree,
                            to: ntree
                        })
                }
                // diff ending
                if (planArr.length != 0) {
                    planArr.push.apply(planArr, await lcsDomtree(ntree.childNodes, otree, INT_OBJ))
                } else {
                    planArr = await lcsDomtree(ntree.childNodes, otree, INT_OBJ)
                }
                delete NsubTree[ni]
                delete OsubTree[oi]
                // NsubTree.splice(ni, 1)
                // OsubTree.splice(oi, 1)
                break
            }
        }
    }
    for (let ni in NsubTree) {
        if (NsubTree[ni]) {
            if (NsubTree[ni].ele.nodeType == 3 && NsubTree[ni].ele.textContent.trim().replace(/\n/g, "") == "") continue;
            planArr.push({
                option: "add",
                before: nodeForTree(NsubTree[ni].before,oldTree),
                after: nodeForTree(NsubTree[ni].after,oldTree),
                ele: NsubTree[ni].ele,
                upper: oldTree
            })
        }
    }
    for (let ni in OsubTree) {
        if (OsubTree[ni]) {
            planArr.push({
                option: "delete",
                ele: OsubTree[ni]
            })
        }
    }

    return planArr
}

function reload_pplan(plan){
    function mergePlans(ps,prop){
        let prev = null,ret = [];
        for (const p of ps) {
            if(prev && p[prop] == prev[prop]){
                // concat each ,if target is same dom
                let o = {
                    option:p.option,
                    ele:p.ele
                }
                o[prop] = prev.ele
                ret.push(o)
            }else{
                ret.push(p)
            }
            prev = p
        }
        return ret;
    }
    let ret = [], dels = [],af =[], bf = [],ap = []
    for (const p of plan) {
        switch(p.option){
            case "add":
                if (p.after != undefined) {
                    af.push({
                        option: "after",
                        ele: p.ele,
                        after: p.after
                    })
                } else if (p.before != undefined) {
                    bf.push({
                        option: "before",
                        ele: p.ele,
                        before: p.before
                    })
                } else {
                    ap.push({
                        option:"append",
                        ele:p.ele,
                        upper: p.upper
                    })
                }
                break;
            case "delete":
                dels.push(p)
                break;
            default:
                ret.push(p)
                break;
        }
    }
    af = mergePlans(af.reverse(),"after")
    bf = mergePlans(bf,"before")
    return [].concat(ap,af,bf,ret,dels)
}

let patch = function* (plan) {
    function patch_on(oldDOM, newDOM) {
        if(oldDOM.nodeType == 3){
            if(oldDOM.textContent != newDOM.textContent)oldDOM.textContent = newDOM.textContent
        }else{
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
                break;
            case "before":
                domApi.insertAfter(ch.ele, ch.before)
                break;
            case "append":
                domApi.append(ch.ele, ch.upper)
                break;
            case "classChange":
                ch.ele.classList = ch.list
                break;
            case "delete":
                domApi.remove(ch.ele)
                break;
            case "attributesChange":
                domApi.attributesClone(ch.ele, ch.to)
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
    let patchArr = await lcsDomtree(newTreeChilds, targetDom, INT_OBJ)
    // dont int patch func
    if (INT_OBJ && INT_OBJ.wtever) return []
    await frameify(patch(patchArr), INT_OBJ)
    // patch(patchArr)
    return patchArr
}

module.exports = diff
