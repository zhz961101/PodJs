const dom_util = require("./dom_util");

// cache
let frag,fragDiv;

function create_dom(html) {
    frag = frag || document.createDocumentFragment();
    if(!fragDiv){
        fragDiv = document.createElement("div");
        frag.appendChild(fragDiv)
    }
    fragDiv.innerHTML = html
    return treeify_childs(fragDiv.childNodes, true)
}

const domSel = d => {
    if (d.nodeType == 11) return "#shadowRoot"
    if (d.nodeType == 3) return "#text"
    return `${d.nodeName}${d.id?"#"+d.id:''}${d.className.split(" ").join(".")}${d.name?'['+d.name+']':''}`
};

function treeify_childs(childs, noidx) {
    let ret = []
    childs = Array.from(childs)
    childs.forEach(d => {
        if (d.nodeType == 8) return;
        if (d.nodeType == 3 && d.data.trim() == "") return;
        ret.push(treeify(d, noidx));
    })
    return ret
}

function treeify($dom, noidx) {
    if (typeof $dom == "undefined") return {}
    return {
        $: $dom,
        sel: domSel($dom),
        tag: $dom.localName,
        type: $dom.nodeType,
        isStruct: $dom.getAttribute ? $dom.getAttribute("structed") == "" : false,
        diffKey: $dom.getAttribute ? $dom.getAttribute("diff_key") : null,
        isEle: $dom.nodeType == 1,
        isText: $dom.nodeType == 3,
        isComment: $dom.nodeType == 8,
        content: $dom.data || $dom.TextContent,
        childs: treeify_childs($dom.childNodes, noidx)
    }
}

function minDistance(sm, sn, compareFn) {
    compareFn = compareFn || ((a, b) => a == b);
    let m = sm.length + 1,
        n = sn.length + 1,
        dp = [];
    for (let i = 0; i < m; i++) {
        dp.push([]);
    }
    dp[0][0] = {
        v: 0,
        li: -1,
        lj: -1
    };
    for (let i = 1; i < m; i++) {
        dp[i][0] = {
            v: dp[i - 1][0].v + 1,
            li: i - 1,
            lj: 0,
            // init for delete
            type: 2,
        };
    }
    for (let j = 1; j < n; j++) {
        dp[0][j] = {
            v: dp[0][j - 1].v + 1,
            li: 0,
            lj: j - 1,
            // init for inster
            type: 1,
        };
    }
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            let cost = 1;
            if (compareFn(sm[i - 1], sn[j - 1])) cost = 0;
            let nv = Math.min(dp[i - 1][j].v + 1, dp[i][j - 1].v + 1, dp[i - 1][j - 1].v + cost);
            dp[i][j] = {
                v: nv
            }
            if (cost == 0) {
                dp[i][j].li = i - 1;
                dp[i][j].lj = j - 1;

                dp[i][j].type = 0;
            } else if (nv == dp[i - 1][j - 1].v + cost) {
                dp[i][j].li = i - 1;
                dp[i][j].lj = j - 1;

                dp[i][j].type = 3;
            } else if (nv == dp[i][j - 1].v + 1) {
                dp[i][j].li = i;
                dp[i][j].lj = j - 1;

                dp[i][j].type = 1;
            } else if (nv == dp[i - 1][j].v + 1) {
                dp[i][j].li = i - 1;
                dp[i][j].lj = j;

                dp[i][j].type = 2;
            } else {
                throw new Error("diff error!!")
            }
        }
    }
    return dp
}

function get_patch_ls(dp, t1, t2, parentNode) {
    let dp_ls = [];
    let i = t1.length,
        j = t2.length;
    while (i > 0 || j > 0) {
        if (typeof dp[i] == "undefined") break;
        if (typeof dp[i][j] == "undefined") break;
        // if (dp[i][j].type != 0) {
        dp_ls.push({
            type: dp[i][j].type,
            pNode: parentNode,
            old: t1[i - 1] || treeify(parentNode.childNodes[0]),
            new: t2[j - 1]
        })
        // }
        let {
            li,
            lj
        } = dp[i][j];
        [i, j] = [li, lj];
    }
    // console.log(dp_ls.map(v => [v.type,v.new && v.new.$,v.old && v.old.$]),dp)
    // 由于插入操作在后面会合并，所以这里的顺序应该根据文档顺序排列
    // 若是不合并成frag的话，这里不用reverse
    return dp_ls.reverse()
    // 也有另外一个方法，需要修改diff_pre中的输出顺序
    // 并修改insert合并顺序，效果是一样的
}

function SameNode(n1, n2) {
    // return n1.digest == n2.digest;
    if (n1.type == 3) return n1.content == n2.content;
    if (n1.isStruct) {
        if (!n2.isStruct) return false;
        if (n1.diffKey || n2.diffKey) return n1.diffKey == n2.diffKey;
    }
    return n1.type == n2.type &&
        n1.tag == n2.tag &&
        n1.sel == n2.sel;
}

function diff_layer(och, nch, parentNode) {
    return get_patch_ls(minDistance(och, nch, SameNode), och, nch, parentNode)
}

// const undiff_threshold = 3.3;

function diff_pre(och, nch, opNode, npNode) {
    if (!opNode) return []
    // 如果一个两个子列表长度相差悬殊，
    // 则不diff，直接替换父节点,前提是父节点存在

    // 如果老树为空则全部变成插入
    if (och.length == 0) {
        return nch.map(vn => ({
            type: 1,
            pNode: opNode || och[0].$.parentNode,
            new: vn
        }));
    }
    // 如果新树为空，则全部变成删除
    if (nch.length == 0) {
        return och.map(vn => ({
            type: 2,
            pNode: opNode || och[0].$.parentNode,
            old: vn
        }))
    }
    return []
}

function diff_deep(och, nch, opNode, npNode) {
    let ret_pre = diff_pre(och, nch, opNode, npNode);
    if (ret_pre.length != 0) return ret_pre;
    let ret = diff_layer(och, nch, opNode);
    for (const patch of ret) {
        if (!patch.old || !patch.new) continue
        if (patch.type != 0) continue
        if (patch.old.childs.length != 0 || patch.new.childs.length != 0) {
            ret = ret.concat(diff_deep(patch.old.childs, patch.new.childs, patch.old.$, patch.new.$))
        }
    }
    return ret;
}

function diff_vdom(ovdoms, nvdoms, opNode) {
    return diff_deep(ovdoms, nvdoms, opNode);
}

// 从dom节点对比html文本
function diff(rootDOM, html) {
    let rchilds = treeify(rootDOM).childs;
    let nchilds = create_dom(html);
    return diff_vdom(rchilds, nchilds, rootDOM);
}

// 深对比，对比两个dom树的结构
function DeepSameNode($a, $b) {
    return SameNode($a, $b) && $a.childs.length == $b.childs.length && $a.childs.reduce((r, d, i) => r && SameNode(d, $b.childs[i]), true)
}

function mergeActions(pLs){
    let dels = pLs.filter(v => v.type == 2);
    let ints = pLs.filter(v => v.type == 1);
    let other = pLs.filter(v => v.type != 1 && v.type != 2);

    let {movs,ndels,nints} = mergeMoveAction(dels,ints);
    let mints = mergeInsert(nints);

    return movs.concat(ndels,mints,other);
}

// 将如果删除和插入操作所操作的是同一个元素，则直接移动
function mergeMoveAction(dels,ints) {
    // return pLs;
    let movs = [];
    for (const deli in dels) {
        const del = dels[deli]
        for (const insi in ints) {
            const ins = ints[insi];
            if (ins && DeepSameNode(ins.new, del.old)) {
                movs.push({
                    type: 4, // move action
                    pNode: ins.pNode,
                    old: del.old,
                    target: ins.old, // target
                });
                dels[deli] = undefined;
                ints[insi] = undefined;
                break;
            }
        }
    }
    // return movs.concat(dels, ints, pLs.filter(v => v.type == 3)).filter(v => v);
    return {movs,ndels:dels,nints:ints};
}

function packInFrag(doma, domb) {
    if (doma.nodeType == 11) {
        doma.appendChild(domb);
        return doma;
    }
    const frag = document.createDocumentFragment();
    frag.appendChild(doma);
    frag.appendChild(domb);
    return frag
}

function mergeInsert(ints) {
    let mCur = 0;
    for (const idx in ints) {
        if (ints.hasOwnProperty(idx)) {
            const insert = ints[idx];
            if (idx == mCur) continue;
            if (insert.old){
                if (insert.old.$ == ints[mCur].old.$) {
                    ints[mCur].new.$ = packInFrag(ints[mCur].new.$, insert.new.$);
                    ints[idx] = undefined;
                    continue
                }
            } else if(insert.pNode == ints[mCur].pNode) {
                ints[mCur].new.$ = packInFrag(ints[mCur].new.$, insert.new.$);
                ints[idx] = undefined;
                continue
            }
            mCur = idx;
        }
    }
    return ints.filter(v => v);
}

function attr_patch(ovDom, nvDom) {
    const nDom = nvDom.$,
        oDom = ovDom.$,
        oAttrs = ovDom.$.attributes,
        nAttrs = nvDom.$.attributes;
    if (!oAttrs || !nAttrs) return;
    Array.from(oAttrs).forEach(attrNode => {
        const attr = attrNode.name;
        if (!nDom.attributes[attr]) // 新dom没有这个attr
            oAttrs.removeNamedItem(attr);
        else if (attr == "value" && nAttrs[attr].defaultValue != oAttrs[attr].defaultValue) {
            return oDom.value = nDom.value;
        } else if (nAttrs[attr].nodeValue != oAttrs[attr].nodeValue) {
            oAttrs[attr].nodeValue = nAttrs[attr].nodeValue;
        }
    })
    Array.from(nAttrs).forEach(attrNode => {
        const attr = attrNode.name;
        if (!oAttrs[attr]) // 老dom没有这个attr
            oAttrs.setNamedItem(nAttrs[attr].cloneNode(true));
        else if (attr == "value" && nAttrs[attr].defaultValue != oAttrs[attr].defaultValue) {
            return oDom.value = nDom.value;
        } else if (nAttrs[attr].nodeValue != oAttrs[attr].nodeValue) {
            oAttrs[attr].nodeValue = nAttrs[attr].nodeValue;
        }
    })
}

function _patch(action) {
    if (!action) return;
    switch (action.type) {
        case 1:
            // insert
            dom_util.insert(action.new, action.old, action.pNode);
            return
        case 2:
            // remove
            dom_util.remove(action.old);
            return
        case 3:
            // replace (insert delete)
            dom_util.replace(action.new, action.old, action.pNode);
            return
        case 33:
            // must replace (insert delete)
            dom_util.replace(action.new, action.old, action.pNode, true);
            return
        case 4:
            // move
            dom_util.move(action.old, action.target, action.pNode);
            return
        case 0:
            // nocahnge
            attr_patch(action.old, action.new);
            return
        default:
            throw new Error(`wrong action.type [${action.type}]`);
    }
}

function patch(actions) {
    actions.forEach(a => _patch(a));
}

module.exports = function diff_patch(rootDOM, html) {
    const srcP = diff(rootDOM, html);
    const mp = mergeActions(srcP);
    patch(mp);
}