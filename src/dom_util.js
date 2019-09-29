module.exports = {
    liteSameNode($a, $b) {
        return $a.tag == $b.tag && $a.type == $b.type && $a.$.id == $b.$.id;
    },
    patch_dom($new, $old) {
        Array.from($new.$.attributes).forEach(attr => {
            $old.$.attributes.setNamedItem(attr.cloneNode());
        })
    },
    remove($dom) {
        if ($dom && $dom.$.parentNode) $dom.$.parentNode.removeChild($dom.$);
    },
    insert($dom, $old, $parent) {
        if ($old) {
            $parent = $old.$.parentNode;
        } else return $parent.appendChild($dom.$);
        if (!$old.$.nextSibling) return $parent.appendChild($dom.$);
        return $parent.insertBefore($dom.$, $old.$.nextSibling);
    },
    replace($dom, $old, $parent, must) {
        if (!must && !$dom.isText && this.liteSameNode($dom, $old)) {
            // If the two elements are the same label name and have the same sub-element structure, then the patch element and the diff sub-element
            this.patch_dom($dom, $old);
            diff_patch_dom($old.$, $dom.$);
            return
        }
        if ($old) {
            $parent = $old.$.parentNode;
        } else throw new Error("diff error, replace element not exist!");
        return $parent.replaceChild($dom.$, $old.$);
    },
    move($dom, $target, $parent) {
        if ($target) {
            $parent = $target.$.parentNode;
        } else return $parent.appendChild($dom.$);
        return $parent.insertBefore($dom.$, $target.$);
    }
}