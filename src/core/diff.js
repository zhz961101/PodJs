const {
    domApi
} = require("../util/util.js");

// const debugObj = require("../util/debug")

let lcsDomArr = (newDomEle, oldDomEle, targetDom) => {
    let planArr = [];
    if (newDomEle.length == 0) {
        for (let _d of oldDomEle) {
            planArr.push({
                option: "delete",
                ele: _d
            })
        }
        return planArr
    }
    if (oldDomEle.length == 0) {
        for (let _d of newDomEle) {
            planArr.push({
                option: "add",
                ele: _d,
                upper: targetDom
            })
        }
        return planArr
    }

    if (newDomEle.length == 1 && oldDomEle.length != 1) {
        for (let di in oldDomEle) {
            let _d = oldDomEle[di]
            if (domApi.isSame(_d, newDomEle[0])) {
                if (!domApi.classListDiff(_d, newDomEle[0]))
                    planArr.push({
                        option: "classChange",
                        ele: _d,
                        list: newDomEle[0].classList
                    })
            } else {
                planArr.push({
                    option: "delete",
                    ele: _d
                })
            }
        }
        return planArr
    }
    if (oldDomEle.length == 1 && newDomEle.length != 1) {
        for (let di in newDomEle) {
            let _d = newDomEle[di]
            if (domApi.isSame(_d, newDomEle[0])) {
                if (!domApi.classListDiff(_d, newDomEle[0]))
                    planArr.push({
                        option: "classChange",
                        ele: _d,
                        list: newDomEle[0].classList
                    })
            } else {
                planArr.push({
                    option: "add",
                    before: oldDomEle[di],
                    after: oldDomEle[di + 1],
                    ele: _d,
                    upper: targetDom
                })
            }
        }
        return planArr
    }

    let lcs_arr = lcsOnArr(newDomEle, oldDomEle, domApi.isSame),
        curA = newDomEle.length - 1,
        curB = oldDomEle.length - 1;

    while (!(curA <= 0 && curB <= 0)) {
        let lv = curB <= 0 ? 0 : lcs_arr[curA][curB - 1],
            tv = curA <= 0 ? 0 : lcs_arr[curA - 1][curB],
            ltv = (curA <= 0 || curB <= 0) ? 0 : lcs_arr[curA - 1][curB - 1],
            nv = lcs_arr[curA][curB];
        // if (ta[curA]==tb[curB]) {
        if (domApi.isSame(newDomEle[curA], oldDomEle[curB]) && curA != 0 && curB != 0) {
            // same char
            // console.log(curA,curB,ltv,nv,ltv+1==nv)
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
            curA -= 1;
            curB -= 1;
        } else if (lv == tv) {
            planArr.push({
                option: "delete",
                ele: oldDomEle[curB]
            })
            planArr.push({
                option: "add",
                before: oldDomEle[curB],
                after: oldDomEle[curB + 1],
                ele: newDomEle[curA],
                upper: targetDom
            })
            curA = curA == 0 ? 0 : curA - 1;
            curB = curB == 0 ? 0 : curB - 1;
        } else if (lv > tv) {
            // ta+1"_" tb+1cahr
            planArr.push({
                option: "delete",
                ele: oldDomEle[curB]
            })
            curB -= 1;
        } else {
            // tb+1"_" ta+1char
            planArr.push({
                option: "add",
                before: oldDomEle[curB],
                after: oldDomEle[curB + 1],
                ele: newDomEle[curA],
                upper: targetDom
            })
            curA -= 1;
        }
    }
    if (!domApi.isSame(newDomEle[0], oldDomEle[0])) {
        planArr.push({
            option: "add",
            before: undefined,
            after: oldDomEle[0],
            ele: newDomEle[0],
            upper: targetDom
        })
        if (oldDomEle[0] != undefined) {
            planArr.push({
                option: "delete",
                ele: oldDomEle[0]
            })
        }
    } else {
        if (newDomEle[0].classList != undefined) {
            if (!domApi.classListDiff(newDomEle[0], oldDomEle[0]))
                planArr.push({
                    option: "classChange",
                    ele: oldDomEle[0],
                    list: newDomEle[0].classList
                })
        }
        if (newDomEle[0].attributes != undefined) {
            if (!domApi.attributesDiff(newDomEle[0], oldDomEle[0]))
                planArr.push({
                    option: "attributesChange",
                    ele: oldDomEle[0],
                    to: newDomEle[0]
                })
        }
    }
    return planArr
}
// #101 Time complexity: O(arr1.length * arr2.length)
let lcsOnArr = (arr1, arr2, compareFn) => {
    // let dbg = new debugObj("lcsOnArr");
    let lcsArr = [];
    for (let indexA in arr1) {
        let rowArr = [],
            itemA = arr1[indexA];
        for (let indexB in arr2) {
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
    // dbg.log()
    return lcsArr;
}
let lcsDomtree = (newChildren, oldTree) => {
    let isSameTree = (ele1, ele2) => {
        return (
            ele1.nodeName == ele2.nodeName &&
            ele1.id == ele2.id &&
            ele1.className == ele2.className
        )
    }
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
                ele: child
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

    let plan = lcsDomArr(Nchi, Ochi, oldTree)

    if (plan.length != 0) {
        planArr.push.apply(planArr, plan)
    }
    for (let ni in NsubTree) {
        let ntree = NsubTree[ni].ele
        for (let oi in OsubTree) {
            let otree = OsubTree[oi]
            if (isSameTree(ntree, otree)) {
                if (planArr.length != 0) {
                    planArr.push.apply(planArr, lcsDomtree(ntree.childNodes, otree))
                } else {
                    planArr = lcsDomtree(ntree.childNodes, otree)
                }
                delete NsubTree[ni]
                delete OsubTree[oi]
                break
            }
        }
    }
    for (let ni in NsubTree) {
        if (NsubTree[ni]) {
            if (NsubTree[ni].ele.nodeType == 3 && NsubTree[ni].ele.textContent.trim().replace(/\n/g, "") == "") continue;
            planArr.push({
                option: "add",
                before: NsubTree[ni].before,
                after: NsubTree[ni].after,
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

let patch = (plan) => {
    for (let ch of plan) {
        if (ch.option == "add") {
            if (ch.after != undefined) {
                domApi.insertBefore(ch.ele, ch.after)
            } else if (ch.before != undefined) {
                domApi.insertAfter(ch.ele, ch.before)
            } else {
                domApi.append(ch.ele, ch.upper)
            }
        }
    }
    for (let ch of plan) {
        if (ch.option == "delete") {
            domApi.remove(ch.ele)
        }
    }
    for (let ch of plan) {
        if (ch.option == "classChange") {
            ch.ele.classList = ch.list
        }
    }
    for (let ch of plan) {
        if (ch.option == "attributesChange") {
            ch.ele.outerHTML = ch.to.outerHTML
        }
    }
}

let diff = (targetDom, newHtml) => {
    let newTreeChilds = domApi.createDomTree(newHtml)
    let patchArr = lcsDomtree(newTreeChilds, targetDom)
    patch(patchArr)
}

module.exports = diff
