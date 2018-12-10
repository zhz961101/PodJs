"use strict";
let $head = document.querySelector("header")
let headHeight = $head.clientHeight
window.onresize = function() {
    let $lnav = document.querySelector('#ScrollLeftNav');
    let $plnav = document.querySelector('.leftNav');
    if ($lnav && $plnav) {
        $lnav.style.width = $plnav.offsetWidth + "px";
    }
}
window.onscroll = function() {
    let $nav = document.querySelector('#ScrollNav'),
        $lnav = document.querySelector('#ScrollLeftNav'),
        $plnav = document.querySelector('.leftNav'),
        $top = document.querySelector("#topprogress");
    if ($top) {
        let p = document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)
        $top.style.width = p * 100 + "%"
    }
    var a = document.documentElement.scrollTop || document.body.scrollTop; //滚动条y轴上的距离
    if (a + 10 >= headHeight) {
        if (!$nav) {
            $nav = document.querySelector("nav").cloneNode(true)
            $nav.setAttribute("id", "ScrollNav")
            $nav.style.cssText = "max-width:unset !important"
            $nav.classList.add("fixed")
            $head.appendChild($nav)
        }
        if ($plnav) {
            if (!$lnav) {
                $lnav = $plnav.cloneNode(true)
                $lnav.setAttribute("id", "ScrollLeftNav")
                $lnav.classList.add("fixed")
                $lnav.style.width = $plnav.offsetWidth + "px";
                $plnav.parentNode.appendChild($lnav)
            }
        }
    } else {
        if ($nav) {
            $head.removeChild($nav)
        }
        if ($plnav && $lnav) {
            $plnav.parentNode.removeChild($lnav)
        }
    }
}
window.onscroll()
