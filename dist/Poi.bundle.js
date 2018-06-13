/*!  版权所有，翻版算球 */!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=7)}([function(e,t,n){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};var o=function(e,t){if(!e||!t)return!1;if(e.length!=t.length)return!1;var n=function(e,t){for(var n in e){var r=!0;for(var o in t)e[n]==t[o]&&(r=!1);if(r)return!1}return!0};return n(e,t)&&n(t,e)},i={$:function(e){var t=document.querySelector(e);return t.html=function(e){return this.empty?"":void 0!=e?(this.innerHTML=e,e):this.innerHTML},t},createDom:function(e){var t=document.createElement("div");return t.innerHTML=e,t.children[0]},createDomTree:function(e){var t=document.createElement("div");return t.innerHTML=e,t.childNodes},append:function(e,t){return e=(void 0===e?"undefined":r(e))==r("")?i.createDom(e):e,t.appendChild(e)},insertBefore:function(e,t){var n=t.parentNode;return e=(void 0===e?"undefined":r(e))==r("")?i.createDom(e):e,n.insertBefore(e,t)},insertAfter:function(e,t){var n=t.parentNode;n.lastChild==t?n.appendChild(e):n.insertBefore(e,t.nextSibling)},remove:function(e){if(void 0!=e){var t=e.parentNode;void 0!=t?t.removeChild(e):e=null}},isSame:function(e,t){return void 0!=e&&void 0!=t&&(e.nodeType==t.nodeType&&(1==e.nodeType?e.nodeName==t.nodeName&&e.id==t.id&&e.innerText.trim()==t.innerText.trim():3==e.nodeType?e.textContent==t.textContent:void 0))},classListDiff:function(e,t){if(e.classList.length!=t.classList.length)return!1;var n=function(e){var t=[];return e.classList.forEach(function(e){t.push(e)}),t};return o(n(e),n(t))},attributesDiff:function(e,t){var n=function(e){for(var t=[],n=0,r=["class"];;){var o=e.attributes[n];if(!o)break;/(.+?):.+?/g.test(o.name)?(r.push(/(.+?):(.+)/g.exec(o.name)[2]),n+=1):-1==r.indexOf(o.name)?(t.push(o.nodeValue),n+=1):n+=1}return t};return o(n(e),n(t))},attributesClone:function(e,t){var n=!0,r=!1,o=void 0;try{for(var i,a=e.attributes[Symbol.iterator]();!(n=(i=a.next()).done);n=!0){var u=i.value;e.attributes.removeNamedItem(u.name)}}catch(e){r=!0,o=e}finally{try{!n&&a.return&&a.return()}finally{if(r)throw o}}var l=!0,c=!1,s=void 0;try{for(var f,p=t.attributes[Symbol.iterator]();!(l=(f=p.next()).done);l=!0){var d=f.value;e.attributes.setNamedItem(d.cloneNode(!0))}}catch(e){c=!0,s=e}finally{try{!l&&p.return&&p.return()}finally{if(c)throw s}}},Comparable:function(e,t){return void 0!=e&&void 0!=t&&(e.nodeType==t.nodeType&&(3==e.nodeType||e.nodeName==t.nodeName&&e.id==t.id&&e.className==t.className))}};e.exports={deepClone:function e(t){var n,r=function(e){var t=Object.prototype.toString;return e instanceof Element?"element":{"[object Boolean]":"boolean","[object Number]":"number","[object String]":"string","[object Function]":"function","[object Array]":"array","[object Date]":"date","[object RegExp]":"regExp","[object Undefined]":"undefined","[object Null]":"null","[object Object]":"object"}[t.call(e)]}(t);if("array"===r)n=[];else{if("object"!==r)return t;n={}}if("array"===r)for(var o=0,i=t.length;o<i;o++)n.push(e(t[o]));else if("object"===r)for(var a in t)n[a]=e(t[a]);return n},extend:function(e,t){for(var n in t)t.hasOwnProperty(n)&&!e.hasOwnProperty(n)&&(e[n]=t[n])},arrMerge:function(e,t){e.push.apply(e,t)},ev_supList:["resize","load","click","dblclick","change","blur","focus","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","select","keypress"],GetAttrElement:function(e,t){for(var n=document.all,r=new Array,o=0;o<n.length;o++)n[o].getAttribute(e)==t&&r.push(n[o]);return r},domApi:i}},function(e,t,n){"use strict";!function(e){function t(e){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t);var n=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return Error.captureStackTrace(n,n.constructor),n.message=e||"Undefined error",n.name="VmError",n}(function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)})(t,Error)}();e.exports={safe:function(e,t,n){var r=["eval","Function"];n=n?n.push.apply(n,r):r;return t=t||{},new Function("sandbox","with(sandbox){"+e.replace("\n","\\n").replace("\t","\\t").replace("\f","\\f").replace("\v","\\v").replace("\r","\\r")+"}")(new Proxy(t,{has:function(e,t){return-1!=n.indexOf(t)||t in e}}))},vm:function(e,t){return t=t||{},new Function("sandbox","with(sandbox){"+e.replace("\n","\\n").replace("\t","\\t").replace("\f","\\f").replace("\v","\\v").replace("\r","\\r")+"}")(new Proxy(t,{has:function(e,t){return!0}}))},micVm:function(e,t){return new Function("obj","with(obj){"+e+"}").apply(t,[t])}}},function(e,t,n){"use strict";var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();var o=n(1),i=(n(0).deepClone,function(){function e(t,n,r){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);var o=function(e){return void 0===e?null:e.replace(/([$|{|}|(|)|.|\\|*|+|?|^|\||\[|\]])/g,"\\$1")};n=o(n)||"<%",r=o(r)||"%>";for(var i=new RegExp(n+"(.+?)"+r,"g"),a=/(^( )?(var|let|if|for|else|switch|case|default|break|{|}|;))(.+)?/g,u=0,l="var r=[];\n",c=void 0,s=function e(t,n){return l+=n?t.match(a)?t+"\n":"r.push("+t+");\n":""!=t?'r.push("'+t.replace(/"/g,'\\"')+'");\n':"",e};c=i.exec(t);)s(t.slice(u,c.index))(c[1],!0),u=c.index+c[0].length;s(t.substr(u,t.length-u)),this.code=(l+'return r.join("");').replace(/[\r\t\n]/g," ")}return r(e,[{key:"joint",value:function(e,t){var n;return n=o.safe(this.code,e),void 0!=t?function(e,t){var n=/<([^/]+?)( [^<>]+)*>/g,r=e.match(n),o=!0,i=!1,a=void 0;try{for(var u,l=r[Symbol.iterator]();!(o=(u=l.next()).done);o=!0){var c=u.value,s=(n=/<([^/]+?)( [^<>]+)*>/g).exec(c)[2];/([^<>]+):([^<>]+)=('|")[^<>]+?\3/g.test(s)&&(e=e.replace(s,s+' PoiId="'+t+'"'))}}catch(e){i=!0,a=e}finally{try{!o&&l.return&&l.return()}finally{if(i)throw a}}return e}(n,t):n}}]),e}());e.exports=i},function(e,t,n){"use strict";var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var i=n(0).ev_supList,a=function(){function e(){o(this,e),this.subscribe={}}return r(e,[{key:"on",value:function(e,t){var n=this.subscribe[e]?this.subscribe[e].func:void 0;void 0==n&&(this.subscribe[e]={locked:0}),this.subscribe[e].func=function(e){"function"==typeof n&&n(e),t(e)}}},{key:"emit",value:function(e,t){if(void 0!==this.subscribe[e]){if(this.subscribe[e].locked>0)return;this.block(e),"function"==typeof this.subscribe[e].func&&this.subscribe[e].func(t),this.unblock(e)}}},{key:"block",value:function(e){void 0!=this.subscribe[e]&&(this.subscribe[e].locked+=1)}},{key:"unblock",value:function(e){void 0!=this.subscribe[e]&&(this.subscribe[e].locked-=1)}},{key:"clear",value:function(){this.subscribe={}}}]),e}(),u=function(e){function t(e){o(this,t);var n=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return n.el=e,n.__init_nativeEv(),n}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,a),r(t,[{key:"__init_nativeEv",value:function(){var e=this;i.forEach(function(t,n){e.el.addEventListener(t,function(n){e.emit(t,n)})})}}]),t}();e.exports=u},function(e,t,n){"use strict";var r=n(0),o=r.deepClone,i=r.extend,a=(r.GetAttrElement,n(2)),u=n(1),l=function e(t,n,r,l,c,s){var f=this;s&&i(n,o(s.data)),this.$pureData=o(n),this.Clone=function(n){return new e(t,o(Object.assign(n,f.$pureData)),o(r),l,c,s)};this.data=function(e,t){var n=function(n){var r=e[n],o={};if("function"==typeof r)return/_ev.emit/g.test(r.toString())?"continue":(e[n]=function(){var n=r.apply(e,arguments);return t.emit("_rerender_"),n},"continue");o.get=function(){return f[n]},o.set=function(e){f[n]!=e&&(f[n]=e,t.emit("SET_"+n,e),t.emit("_rerender_"))},Object.defineProperty(e,n,o),e[n]=r};for(var r in e)n(r);return e}(n,l),this.$localPo=[],void 0!=c&&(t=function(e,t,n,r){var i=function(e){var t={};if(void 0==e||0==e.length)return t;var n=e.split(" "),r=new RegExp("(.+?)=([\"'])(.+?)\\2"),o=!0,i=!1,a=void 0;try{for(var u,l=n[Symbol.iterator]();!(o=(u=l.next()).done);o=!0){var c=u.value;if(""!=c.trim()){var s=r.exec(c);t[s[1]]=s[3]}}}catch(e){i=!0,a=e}finally{try{!o&&l.return&&l.return()}finally{if(i)throw a}}return t},a=e,u=0;for(var l in t){var c=t[l],s=new RegExp("<("+l+")(( [^<> ]*)*)>([^<>]*)</"+l+">","gi"),f=e.match(s);if(f)for(var p in f){var d=f[p],v=(s=new RegExp("<("+l+")(( [^<> ]*)*)>([^<>]*)</"+l+">","gi")).exec(d),h=i(v[2]);h._content=v[4],n&&Object.assign(h,n),void 0==r[u]?r.push(c.Clone(h)):r[u].data=Object.assign(o(h),c.data);var b=r[u].assemble(h,u);a=a.replace(d,b),u+=1}}return a}(t,c,this.data,this.$localPo)),this.tpl=new a(t,"{{","}}");r&&function(e,t){var n=function(n){"function"==typeof e[n]&&t.on("SET_"+n,function(t){e[n](t)})};for(var r in e)n(r)}(r,l),this.assemble=function(e,t){return l.block("_rerender_"),void 0!=e?Object.assign(e,this.data):e=o(this.data),l.unblock("_rerender_"),this.tpl.joint(e,t)};this.bind=function(e){if(0!=e.length){var t=[],n=[],r=function e(r){if(3!=r.nodeType){if(0!=r.children.length)for(var o in r.children){if("length"==o)break;e(r.children[o])}var i=r.attributes;if(0!=i.length){var a=function(e){return/bind:/g.test(e.nodeName)};for(var u in i){var l=i[u];/on:/g.test(l.nodeName)&&n.push({ele:r,eventName:l.nodeName.split(":")[1],codeStr:l.nodeValue}),a(l)&&t.push({ele:r,eventName:l.nodeName.split(":")[1],codeStr:l.nodeValue})}}}};for(var o in e){var i=e[o];"add"!=i.option&&"attributesChange"!=i.option||r(i.ele)}0!=n.length&&function(e,t){for(var n in t)t.hasOwnProperty(n)&&function(){var r=t[n],o=r.eventName,i=r.codeStr,a=f.data,l=r.ele,c={};if(void 0!=l.attributes.PoiId){var s=l.attributes.PoiId.nodeValue;c=f.$localPo[s].data}e.on(o,function(e){e.target===l&&(Object.assign(a,{e:e,self:e.target},c),u.safe(i,a))})}()}(l,n),0!=t.length&&function(e,t){for(var n in t)t.hasOwnProperty(n)&&function(){var r=t[n],o=r.eventName,i=r.codeStr,a=f.data,l=r.ele,c={};if(void 0!=l.attributes.PoiId){var s=l.attributes.PoiId.nodeValue;c=f.$localPo[s].data}"class"==o&&(o="className"),l[o]=u.safe("return("+i+")",Object.assign(c,a)),e.on("_rerender_",function(){l&&null!=l.parentNode&&(l[o]=u.safe("return("+i+")",Object.assign(c,a)))})}()}(l,t)}}};e.exports={Po:l,generateSubPo:function(e,t){var n={};for(var r in e){var i=e[r],a=void 0;a="#"==i.tpl[0]?document.querySelector(i.tpl).innerHTML:i.tpl,n[r]=new l(a,o(i.data),{},t)}return n}}},function(e,t,n){"use strict";var r=n(0).domApi,o=function(e,t,n){var r=[];for(var o in e){var i=[],a=e[o];for(var u in t){var l=t[u],c=0==u?0:i[u-1],s=0==o?0:r[o-1][u],f=0!=u&&0!=o?r[o-1][u-1]:0;n(a,l)?i.push(f+1):i.push(c>s?c:s)}r.push(i)}return r},i=function e(t,n){var i=[],a=[],u=[],l=[],c=[];for(var s in t){if("length"==s)break;var f=t[s];3==f.nodeType&&""==f.textContent.trim().replace(/\n/g,"")||(3==f.nodeType||0==f.children.length?i.push(f):l.push({ele:f}))}for(var p in n.childNodes){if("length"==p)break;var d=n.childNodes[p];if(3!=d.nodeType||""!=d.textContent.trim().replace(/\n/g,""))if(3==d.nodeType||0==d.children.length){var v=!1;if(3!=d.nodeType){var h=!0,b=!1,y=void 0;try{for(var m,g=l[Symbol.iterator]();!(h=(m=g.next()).done);h=!0){var _=m.value;if(r.isSame(_.ele,d)){c.push(d),v=!0;break}}}catch(e){b=!0,y=e}finally{try{!h&&g.return&&g.return()}finally{if(b)throw y}}}if(v)continue;a.push(d)}else c.push(d)}if(0==a.length&&0==c.length)for(var w in i=[],l=[],t){if("length"==w)break;var x=t[w];3==x.nodeType&&""==x.textContent.trim().replace(/\n/g,"")||i.push(x)}var j,S,T=function(e,t,n){var i=[];if(0==t.length){for(var a in e)i.push({option:"add",ele:e[a],upper:n});return i}if(0==e){for(var u in t)i.push({option:"delete",ele:t[u]});return i}for(var l=o(e,t,r.isSame),c=0,s=0;!(c>=l.length&&s>=l[0].length);){var f=l[c+1]?l[c+1]:[],p=l[c]?l[c]:[],d=p[s+1]?p[s+1]:0,v=f[s]?f[s]:0,h=f[s+1]?f[s+1]:0,b=p[s];r.isSame(e[c],t[s])?(void 0!=e[c].classList&&(r.classListDiff(e[c],t[s])||i.push({option:"classChange",ele:t[s],list:e[c].classList})),void 0!=e[c].attributes&&(r.attributesDiff(e[c],t[s])||i.push({option:"attributesChange",ele:t[s],to:e[c]})),c+=1,s+=1):0!=b||1==h?d!=v?d>v?(i.push({option:"delete",ele:t[s]}),s+=1):(i.push({option:"add",before:t[s],after:t[s+1],ele:e[c],upper:n}),c+=1):(i.push({option:"delete",ele:t[s]}),i.push({option:"add",before:t[s],after:t[s+1],ele:e[c],upper:n}),c+=1,s+=1):(i.push({option:"add",before:t[s],after:t[s+1],ele:e[c],upper:n}),c+=1)}return i}(i,a,n);for(var E in 0!=T.length&&u.push.apply(u,T),l){var P=l[E].ele;for(var k in c){var O=c[k];if(S=O,(j=P).nodeName==S.nodeName&&j.id==S.id&&j.className==S.className){void 0!=P.classList&&(r.classListDiff(P,O)||u.push({option:"classChange",ele:O,list:P.classList})),void 0!=P.attributes&&(r.attributesDiff(P,O)||u.push({option:"attributesChange",ele:O,to:P})),0!=u.length?u.push.apply(u,e(P.childNodes,O)):u=e(P.childNodes,O),delete l[E],delete c[k];break}}}for(var N in l)if(l[N]){if(3==l[N].ele.nodeType&&""==l[N].ele.textContent.trim().replace(/\n/g,""))continue;u.push({option:"add",before:l[N].before,after:l[N].after,ele:l[N].ele,upper:n})}for(var C in c)c[C]&&u.push({option:"delete",ele:c[C]});return u};e.exports=function(e,t){var n=r.createDomTree(t),o=i(n,e);return function(e){var t=!0,n=!1,o=void 0;try{for(var i,a=e[Symbol.iterator]();!(t=(i=a.next()).done);t=!0){var u=i.value;"add"==u.option&&(void 0!=u.after?r.insertBefore(u.ele,u.after):void 0!=u.before?r.insertAfter(u.ele,u.before):r.append(u.ele,u.upper))}}catch(e){n=!0,o=e}finally{try{!t&&a.return&&a.return()}finally{if(n)throw o}}var l=!0,c=!1,s=void 0;try{for(var f,p=e[Symbol.iterator]();!(l=(f=p.next()).done);l=!0){var d=f.value;"delete"==d.option&&r.remove(d.ele)}}catch(e){c=!0,s=e}finally{try{!l&&p.return&&p.return()}finally{if(c)throw s}}var v=!0,h=!1,b=void 0;try{for(var y,m=e[Symbol.iterator]();!(v=(y=m.next()).done);v=!0){var g=y.value;"classChange"==g.option&&(g.ele.classList=g.list)}}catch(e){h=!0,b=e}finally{try{!v&&m.return&&m.return()}finally{if(h)throw b}}var _=!0,w=!1,x=void 0;try{for(var j,S=e[Symbol.iterator]();!(_=(j=S.next()).done);_=!0){var T=j.value;"attributesChange"==T.option&&r.attributesClone(T.ele,T.to)}}catch(e){w=!0,x=e}finally{try{!_&&S.return&&S.return()}finally{if(w)throw x}}}(o),o}},function(e,t,n){"use strict";var r=n(3),o=n(5),i=n(4),a=i.Po,u=i.generateSubPo,l=n(0).domApi;e.exports=function(e){var t=void 0;if(e.tpl)if("#"==e.tpl[0]){if(void 0==(t=document.querySelector(e.tpl).innerHTML))return new Error("not found template element "+e.tpl)}else t=e.tpl;else if("#"==e.el[0]){if(void 0==(t=document.querySelector(e.el).innerHTML))return new Error("not found element "+e.el)}else t=t.replace(/&lt;/g,"<").replace(/&gt;/g,">");var n=function(e,t,n,i,c,s,f){var p=this;this.el=l.$(e),this.Event=new r(this.el),this.$on=function(){this.Event.on.apply(this.Event,arguments)},this.$emit=function(){this.Event.emit.apply(this.Event,arguments)};var d=this;this.render=function(){p.$on("_rerender_",function(){d.rerender()}),p.Event.block("_rerender_"),p.el.html("");var e=o(p.el,p.Po.assemble());0!=e.length&&p.Po.bind(e),p.Event.unblock("_rerender_")},this.rerender=function(){p.Event.block("_rerender_");var e=o(p.el,p.Po.assemble());p.Po.bind(e),p.Event.unblock("_rerender_")};var v=c?u(c,this.Event):void 0;if(this.Po=new a(t,n,i,this.Event,v,s),this.$data=this.Po.data,s&&s.mounts){var h=function(e){f[e]=e in f?function(){s.mounts[e].apply(p),f[e].apply(p)}:s.mounts[e]};for(var b in s.mounts)h(b)}return f&&f.init&&f.init.apply(this.Po.data),this}.apply({},[e.el,t,e.data,e.watch,e.components,e.mixwith,e.mounted]);return n.render(),n}},function(e,t,n){"use strict";var r,o=n(6),i=n(3),a=n(2),u=n(1);o.__TEST__={ev:(r=new i(document),r.on("__TEST__",function(){console.log("event manger is working!")}),r),tpl:function(e,t){return new a(e).joint(t||{})},vm:u},window.Poi=o;console&&console.log('\n        thx for u using!!!!poi~\n\n        now,poi is working!\n        you can use the following instructions to do a few simple tests of functional integrity:\n\n        >> Poi.__TEST__.tpl("<% console.log(\'getcha\') %>",{console:console})\n        >> Poi.__TEST__.ev.emit("__TEST__")\n        >> Poi.__TEST__.vm.safe("console.log(msg)",{msg:"yahoo!"})\n        ')}]);