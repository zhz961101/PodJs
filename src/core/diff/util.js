module.exports = {
    childClean,
    isSameTree,
    reload_pplan
}

function childClean(chs) {
    const re = /^\s+$/
    let res = []
    for (const c of chs) {
        if (c.nodeType == 3 && re.test(c.data)) continue
        else res.push(c)
    }
    return res
}

function mergePlans(ps, prop) {
    let prev = null,
        ret = [];
    for (const p of ps) {
        if (prev && p[prop] == prev[prop]) {
            // concat each ,if target is same dom
            let o = {
                option: p.option,
                ele: p.ele,
                upper: p.upper
            }
            o[prop] = prev.ele
            ret.push(o)
        } else {
            ret.push(p)
        }
        prev = p
    }
    return ret;
}


const toarr = o => Array.prototype.slice.call(o)
const layer_num = ele => ele.parentNode ? toarr(ele.parentNode.children).indexOf(ele) : 0

function isSameTree(ele1, ele2) {
    if (ele1.nodeType == 1 && ele1.children.length == 0) return false
    return (
        ele1.nodeName == ele2.nodeName &&
        ele1.nodeType == ele2.nodeType &&
        layer_num(ele1) == layer_num(ele2)
    )
}

function reload_pplan(plan) {
    let targetHost = new WeakMap()
    for (const p of plan) {
        switch (p.option) {
            case "classChange":
            case "attributesChange":
                targetHost.set(p.target, p.ele)
                break;
            case "patch":
                targetHost.set(p.new, p.old)
                break;
            default:
                break;
        }
    }


    let ret = [],
        dels = [],
        af = [],
        bf = [],
        ap = []
    for (const p of plan) {
        switch (p.option) {
            case "add":
                if (p.before != undefined) {
                    bf.push({
                        option: "before",
                        ele: p.ele,
                        before: targetHost.get(p.before) || p.before,
                        upper: p.upper
                    })
                } else if (p.after != undefined) {
                    af.push({
                        option: "after",
                        ele: p.ele,
                        after: targetHost.get(p.after) || p.after,
                        upper: p.upper
                    })
                } else {
                    ap.push({
                        option: "append",
                        ele: p.ele,
                        upper: targetHost.get(p.upper) || p.upper
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
    af = mergePlans(af.reverse(), "after")
    bf = mergePlans(bf, "before")
    return [].concat(ap, bf, af, ret, dels)
}