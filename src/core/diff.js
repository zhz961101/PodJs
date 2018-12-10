
const {domApi} = require("../util/domApi.js");

const {
    frameify
} = require('../util/frameify.js');

// const debugObj = require("../util/debug")
let _lcsDomArr = async (newDomEle, oldDomEle, targetDom) => {
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
    let lcs_arr = await frameify(lcsOnArr(newDomEle, oldDomEle, domApi.isSame)),
        curA = 0,
        curB = 0;

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
            planArr.push({
                option: "delete",
                ele: oldDomEle[curB]
            })
            // #201 Matrix boundary
            if(newDomEle[curA] != undefined)
                planArr.push({
                    option: "add",
                    before: oldDomEle[curB],
                    after: oldDomEle[curB + 1],
                    ele: newDomEle[curA],
                    upper: targetDom
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
let lcsOnArr = function*(arr1, arr2, compareFn) {
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
let lcsDomtree = async (newChildren, oldTree) => {
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
    let plan = await _lcsDomArr(Nchi, Ochi, oldTree)

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
                    planArr.push.apply(planArr,await lcsDomtree(ntree.childNodes, otree))
                } else {
                    planArr = await lcsDomtree(ntree.childNodes, otree)
                }
                NsubTree.splice(ni,1)
                OsubTree.splice(oi,1)
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

let patch = function*(plan) {
    for (let ch of plan) {
        yield void 0;
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
        yield void 0;
        if (ch.option == "delete") {
            domApi.remove(ch.ele)
        }
    }
    for (let ch of plan) {
        yield void 0;
        if (ch.option == "classChange") {
            ch.ele.classList = ch.list
        }
    }
    for (let ch of plan) {
        yield void 0;
        if (ch.option == "attributesChange") {
            domApi.attributesClone(ch.ele, ch.to)
        }
    }
}

let diff = async (targetDom, newHtml) => {
    let newTreeChilds = domApi.createDomTree(newHtml)
    let patchArr = await lcsDomtree(newTreeChilds, targetDom)
    await frameify(patch(patchArr))
    return patchArr
}

module.exports = diff
