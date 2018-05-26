/*!  版权所有，翻版算球 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Poi.js":
/*!********************!*\
  !*** ./src/Poi.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar EventObj = __webpack_require__(/*! ./event.js */ \"./src/event.js\");\nvar TplEng = __webpack_require__(/*! ./template.js */ \"./src/template.js\");\nvar Jsvm = __webpack_require__(/*! ./util/JsVm.js */ \"./src/util/JsVm.js\");\n\nvar _require = __webpack_require__(/*! ./util/util.js */ \"./src/util/util.js\"),\n    deepClone = _require.deepClone,\n    extend = _require.extend,\n    GetAttrElement = _require.GetAttrElement;\n\nvar evIdSuffix = \"event-id\";\n\nvar _focus = document;\n\nvar Po = function Po(name, template, data, watch, evManger, subPos, mixwith) {\n    var _this = this;\n\n    if (mixwith) {\n        extend(data, deepClone(mixwith.data));\n    }\n    this.name = name;\n    // tpl\n\n    var _init_DateValueProperty = function _init_DateValueProperty(data, _ev) {\n        var _loop = function _loop(variable) {\n            var setVal = data[variable];\n            var option = {};\n            if (typeof setVal === \"function\") {\n                option.get = function () {\n                    return setVal(data);\n                };\n            } else {\n                option.get = function () {\n                    return _this[variable];\n                };\n            }\n            option.set = function (newVal) {\n                _this[variable] = newVal;\n                _ev.emit(\"SET_\" + variable, newVal);\n                _ev.emit(\"_rerender_\");\n            };\n            Object.defineProperty(data, variable, option);\n            data[variable] = setVal;\n        };\n\n        for (var variable in data) {\n            _loop(variable);\n        }\n        return data;\n    };\n    // data\n    this.data = _init_DateValueProperty(data, evManger);\n    //\n    this.tpl = new TplEng(template, \"{{\", \"}}\"); //new Template(template,subPos);\n    var hitchOnEv = function hitchOnEv(_evManger, _on) {\n        for (var event_ in _on) {\n            if (_on.hasOwnProperty(event_)) {\n                (function () {\n                    var thisOption = _on[event_],\n                        evName = thisOption.eventName,\n                        evId = thisOption.id,\n                        coStr = thisOption.codeStr,\n                        that_data = _this.data;\n                    _evManger.on(evName, function (e) {\n                        _focus = evId;\n                        if (e.target.getAttribute(\"data-event-id\") === evId) {\n                            var dataobj = Object.assign(that_data, {\n                                e: e,\n                                self: e.target\n                            });\n                            __webpack_require__(/*! ./util/JsVm.js */ \"./src/util/JsVm.js\").safe(coStr, that_data);\n                        }\n                    });\n                })();\n            }\n        }\n        // on_ev end\n    };\n    this._ev = this.tpl.tpl_events;\n    hitchOnEv(evManger, this._ev.on);\n\n    var hitchWath = function hitchWath(watch, _ev) {\n        var _loop2 = function _loop2(variable) {\n            if (typeof watch[variable] === \"function\") {\n                _ev.on(\"SET_\" + variable, function (newVal) {\n                    watch[variable](newVal);\n                });\n            }\n        };\n\n        for (var variable in watch) {\n            _loop2(variable);\n        }\n    };\n    hitchWath(watch, evManger);\n    this.assemble = function () {\n        return _this.tpl.joint(_this.data);\n    };\n    var hitchBindEv = function hitchBindEv(_evManger, _bind) {\n        for (var _ev in _bind) {\n            if (_bind.hasOwnProperty(_ev)) {\n                (function () {\n                    var thisOption = _bind[_ev],\n                        evName = thisOption.eventName,\n                        evId = thisOption.id,\n                        valName = thisOption.codeStr,\n                        ele = GetAttrElement(\"data-event-id\", evId)[0];\n                    ele[evName] = _this.data[valName];\n                    // init value\n                    _evManger.on(\"SET_\" + valName, function (newVal) {\n                        if (ele) {\n                            ele[evName] = newVal;\n                        }\n                    });\n                })();\n            }\n        }\n    };\n    this.bind = function () {\n        hitchBindEv(evManger, _this._ev.bind);\n    };\n};\n\nvar _Poi = function _Poi(id, template, data, watch, subPos, mixwith) {\n    var _this2 = this;\n\n    var _$ = function _$(id) {\n        var _ele = document.querySelector(id);\n        _ele.html = function (_newHtml) {\n            if (this.empty) {\n                return '';\n            }\n            if (!_newHtml) {\n                return this.innerHTML;\n            } else {\n                this.innerHTML = _newHtml;\n                return _newHtml;\n            }\n        };\n        return _ele;\n    };\n    this.el = _$(id);\n    // on,emit\n    this.Event = new EventObj(_$(id));\n    this.$on = function () {\n        this.Event.on.apply(this.Event, arguments);\n    };\n    this.$emit = function () {\n        this.Event.emit.apply(this.Event, arguments);\n    };\n    this.render = function () {\n        _this2.el.html(_this2.Po.assemble());\n        _this2.Po.bind();\n        _this2.$on(\"_rerender_\", function () {\n            that.rerender();\n            GetAttrElement(\"data-\" + evIdSuffix, _focus)[0].focus();\n        });\n    };\n    this.rerender = function () {\n        // dirty checking maybe\n        // this.render()\n        _this2.el.html(_this2.Po.assemble());\n        _this2.Po.bind();\n    };\n    var that = this;\n    // item\n    this.Po = new Po(\"root\", template, data, watch, this.Event, subPos, mixwith);\n    this.$data = this.Po.data;\n    return this;\n};\n\nvar Poi = function Poi(config) {\n    var that_tpl = document.querySelector(config.id).innerHTML;\n    var that = _Poi.apply({}, [config.id, that_tpl, config.data, config.watch, undefined, config.mixwith]);\n    that.render();\n    return that;\n};\n\nmodule.exports = Poi;\n\n//# sourceURL=webpack:///./src/Poi.js?");

/***/ }),

/***/ "./src/event.js":
/*!**********************!*\
  !*** ./src/event.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar _require = __webpack_require__(/*! ./util/util.js */ \"./src/util/util.js\"),\n    ev_supList = _require.ev_supList;\n\nvar isFunction = function isFunction(obj) {\n    return typeof obj === \"function\";\n};\n\nvar EventObj = function () {\n    function EventObj() {\n        _classCallCheck(this, EventObj);\n\n        this.subscribe = {};\n    }\n\n    _createClass(EventObj, [{\n        key: \"on\",\n        value: function on(channel, fn) {\n            var old = this.subscribe[channel];\n            this.subscribe[channel] = function (_args) {\n                if (isFunction(old)) {\n                    old(_args);\n                }\n                fn(_args);\n            };\n        }\n    }, {\n        key: \"emit\",\n        value: function emit(channel, _args) {\n            if (this.subscribe[channel] !== undefined) {\n                if (isFunction(this.subscribe[channel])) {\n                    this.subscribe[channel](_args);\n                }\n            }\n        }\n    }, {\n        key: \"clear\",\n        value: function clear() {\n            this.subscribe = {};\n        }\n    }]);\n\n    return EventObj;\n}();\n\nvar EventObjForEle = function (_EventObj) {\n    _inherits(EventObjForEle, _EventObj);\n\n    function EventObjForEle(ele) {\n        _classCallCheck(this, EventObjForEle);\n\n        var _this = _possibleConstructorReturn(this, (EventObjForEle.__proto__ || Object.getPrototypeOf(EventObjForEle)).call(this));\n\n        _this.el = ele;\n        _this.__init_nativeEv();\n        return _this;\n    }\n\n    _createClass(EventObjForEle, [{\n        key: \"__init_nativeEv\",\n        value: function __init_nativeEv() {\n            var _this2 = this;\n\n            ev_supList.forEach(function (val, index) {\n                _this2.el.addEventListener(val, function (e) {\n                    _this2.emit(val, e);\n                });\n            });\n        }\n    }]);\n\n    return EventObjForEle;\n}(EventObj);\n\nmodule.exports = EventObjForEle;\n\n//# sourceURL=webpack:///./src/event.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar Poi = __webpack_require__(/*! ./Poi.js */ \"./src/Poi.js\");\nvar EventObj = __webpack_require__(/*! ./event.js */ \"./src/event.js\");\nvar TplEng = __webpack_require__(/*! ./template.js */ \"./src/template.js\");\nvar Jsvm = __webpack_require__(/*! ./util/JsVm.js */ \"./src/util/JsVm.js\");\n\nPoi.__TEST__ = {\n    ev: function () {\n        var evobj = new EventObj(document);\n        evobj.on(\"__TEST__\", function () {\n            console.log(\"event manger is working!\");\n        });\n        return evobj;\n    }(),\n    tpl: function tpl(_t, _d) {\n        return new TplEng(_t).joint(_d || {});\n    },\n    vm: Jsvm\n};\nwindow.Poi = Poi;\n\nvar usage = function usage() {\n    if (console) {\n        var msg = \"\\n        thx for u using!!!!poi~\\n\\n        now,poi is working!\\n        you can use the following instructions to do a few simple tests of functional integrity:\\n\\n        >> Poi.__TEST__.tpl(\\\"<% console.log('getcha') %>\\\",{console:console})\\n        >> Poi.__TEST__.ev.emit(\\\"__TEST__\\\")\\n        >> Poi.__TEST__.vm.safe(\\\"console.log(msg)\\\",{msg:\\\"yahoo!\\\"})\\n        \";\n        console.log(msg);\n    }\n};\nusage();\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ }),

/***/ "./src/template.js":
/*!*************************!*\
  !*** ./src/template.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n// <a bind:herf=\"url\"></a>\n// <a herf=\"<% url %>\"></a>\n// <a on:click=\"alertLove\"></a>\n// <a data-event-id=random></a>\n//\n// upper.addlisenter(\"click\",(e)=>{\n//      e.target.getAttribute(\"data-event-id\")==random?alertLove(e):undefined;\n// })\n//\n// <input model:value=\"url\"></input>\n// <input bind:value=\"url\" on:onchage=\"url = this.value\"></input>\n\nvar Jsvm = __webpack_require__(/*! ./util/JsVm.js */ \"./src/util/JsVm.js\");\n\nvar _require = __webpack_require__(/*! ./util/util.js */ \"./src/util/util.js\"),\n    deepClone = _require.deepClone;\n\nvar evIdSuffix = \"event-id\";\n\nvar randHash = function randHash(H_length) {\n    H_length = H_length || 10;\n    var res = \"\",\n        $chars = \"ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678\",\n        maxPos = $chars.length;\n    for (var i = 0; i < H_length; i++) {\n        res += $chars.charAt(Math.floor(Math.random() * maxPos));\n    }\n    return res;\n};\n\nvar TemplateEngine = function () {\n    function TemplateEngine(html, preMark, tailMark) {\n        _classCallCheck(this, TemplateEngine);\n\n        this.tpl_events = {\n            on: [],\n            bind: []\n        };\n        html = this.prehtml(html);\n        var fixRegKeyWord = function fixRegKeyWord(str) {\n            return str === undefined ? null : str.replace(/([$|{|}|(|)|.|\\\\|*|+|?|^|\\||\\[|\\]])/g, \"\\\\$1\");\n        };\n        preMark = fixRegKeyWord(preMark) || \"<%\";\n        tailMark = fixRegKeyWord(tailMark) || \"%>\";\n        var re = new RegExp(preMark + \"(.+?)\" + tailMark, \"g\"),\n            reExp = /(^( )?(var|let|if|for|else|switch|case|break|{|}|;))(.*)?/g,\n            cursor = 0,\n            code = 'var r=[];\\n',\n            match = void 0;\n        var add = function add(line, js) {\n            js ? code += line.match(reExp) ? line + '\\n' : 'r.push(' + line + ');\\n' : code += line != '' ? 'r.push(\"' + line.replace(/\"/g, '\\\\\"') + '\");\\n' : '';\n            return add;\n        };\n        while (match = re.exec(html)) {\n            add(html.slice(cursor, match.index))(match[1], true);\n            cursor = match.index + match[0].length;\n        }\n        add(html.substr(cursor, html.length - cursor));\n        this.code = (code + 'return r.join(\"\");').replace(/[\\r\\t\\n]/g, ' ');\n    }\n\n    _createClass(TemplateEngine, [{\n        key: \"prehtml\",\n        value: function prehtml(html) {\n            var insert_item = function insert_item(str, item, index) {\n                var newstr = \"\"; //初始化一个空字符串\n                var tmp = str.substring(0, index);\n                var estr = str.substring(index, str.length);\n                newstr += tmp + item + estr;\n                return newstr;\n            };\n            var repRegArr = function repRegArr(text, s_reg, repStr) {\n                text = text.replace(s_reg, \"\");\n                return insert_item(text, repStr, text.indexOf(\">\"));\n            };\n            var rep_non_print = function rep_non_print(text) {\n                return text.replace(\"\\n\", \"\\\\n\").replace(\"\\t\", \"\\\\t\").replace(\"\\f\", \"\\\\f\").replace(\"\\v\", \"\\\\v\").replace(\"\\r\", \"\\\\r\");\n            };\n            var pushEventTo = function pushEventTo(arr, option_html, hash_id) {\n                var eReg = / (bind|on|model):(.+?)=(\\\\?('|\")([\\s\\S]+?)\\\\?\\4)/g;\n                var _option = eReg.exec(option_html);\n                arr[_option[1]].push({\n                    id: hash_id,\n                    eventName: _option[2],\n                    codeStr: rep_non_print(_option[5])\n                });\n            };\n            var tagReg = /<[\\s\\S]+?>/g;\n            var eventReg = / (bind|on|model):(.+?)=(\\\\?('|\")([\\s\\S]+?)\\\\?\\4)/g;\n            var tagArr = html.match(tagReg);\n            var textArr = html.split(tagReg);\n            for (var i = 0; i < tagArr.length; i++) {\n                var attributes = tagArr[i].match(eventReg);\n                if (attributes) {\n                    var hash_id = randHash();\n                    if (attributes.length > 1) {\n                        for (var j = 0; j < attributes.length; j++) {\n                            pushEventTo(this.tpl_events, attributes[j], hash_id);\n                        }\n                    } else if (attributes.length === 1) {\n                        pushEventTo(this.tpl_events, attributes[0], hash_id);\n                    }\n                    tagArr[i] = repRegArr(tagArr[i], eventReg, \" data-\" + evIdSuffix + \"='\" + hash_id + \"'\");\n                }\n            }\n            var newHeml = textArr[0];\n            for (var _i = 0; _i < tagArr.length; _i++) {\n                newHeml += tagArr[_i];\n                newHeml += textArr[_i + 1] ? textArr[_i + 1] : \"\";\n            }\n            return newHeml;\n        }\n    }, {\n        key: \"joint\",\n        value: function joint(options) {\n            var result = void 0;\n            try {\n                // result = new Function('obj', this.code).apply(options, [options]);\n                result = Jsvm.vm(this.code, deepClone(options));\n            } catch (err) {\n                console.error(\"'\" + err.message + \"'\", \" in \\n\\nCode:\\n\", this.code.replace(/;/g, \";\\n\").replace(/({|})/g, \"$1\\n\"));\n            }\n            return result;\n        }\n    }]);\n\n    return TemplateEngine;\n}();\n\nmodule.exports = TemplateEngine;\n\n//# sourceURL=webpack:///./src/template.js?");

/***/ }),

/***/ "./src/util/JsVm.js":
/*!**************************!*\
  !*** ./src/util/JsVm.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nvar extend = function extend(o, n) {\n    for (var p in n) {\n        if (n.hasOwnProperty(p) && !o.hasOwnProperty(p)) o[p] = n[p];\n    }\n};\nvar JSvm = function JSvm(code, sandbox) {\n    var rep_non_print = function rep_non_print(text) {\n        return text.replace(\"\\n\", \"\\\\n\").replace(\"\\t\", \"\\\\t\").replace(\"\\f\", \"\\\\f\").replace(\"\\v\", \"\\\\v\").replace(\"\\r\", \"\\\\r\");\n    };\n    sandbox = sandbox || {};\n    var fn = new Function('sandbox', \"with(sandbox){\" + rep_non_print(code) + \"}\");\n    var _proxy = new Proxy(sandbox, {\n        has: function has(target, key) {\n            return true;\n        }\n    });\n    return fn(_proxy);\n};\nvar multiCode2Tuple = function multiCode2Tuple(code) {\n    return code.replace(/(^|;)return /g, \"\").replace(/([\"'])(.+?)(;)(.+?)\\1/g, \"$1$2$3#$4$1\").split(/;(?!#)/g).join(\",\").replace(\";#\", \";\");\n};\n\nvar VmError = function (_Error) {\n    _inherits(VmError, _Error);\n\n    function VmError(message) {\n        _classCallCheck(this, VmError);\n\n        var _this = _possibleConstructorReturn(this, (VmError.__proto__ || Object.getPrototypeOf(VmError)).call(this));\n\n        Error.captureStackTrace(_this, _this.constructor);\n        _this.message = message || 'Undefined error';\n        _this.name = 'VmError';\n        return _this;\n    }\n\n    return VmError;\n}(Error);\n\nvar safeSandBox = {\n    console: window.console,\n    alert: function alert(msg) {\n        window.alert(msg);\n    },\n    debugger: window.debugger,\n    Error: VmError\n};\nvar JSafeVm = function JSafeVm(code, data) {\n    data = data || {};\n    try {\n        code = \"return (\" + multiCode2Tuple(code) + \")\";\n    } catch (e) {\n        console.error(e);\n    }\n    data = Object.assign(data, safeSandBox);\n    return JSvm(code, data);\n};\n\nmodule.exports = {\n    safe: JSafeVm,\n    vm: JSvm\n};\n\n//# sourceURL=webpack:///./src/util/JsVm.js?");

/***/ }),

/***/ "./src/util/util.js":
/*!**************************!*\
  !*** ./src/util/util.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nfunction getType(obj) {\n    //tostring会返回对应不同的标签的构造函数\n    var toString = Object.prototype.toString;\n    var map = {\n        '[object Boolean]': 'boolean',\n        '[object Number]': 'number',\n        '[object String]': 'string',\n        '[object Function]': 'function',\n        '[object Array]': 'array',\n        '[object Date]': 'date',\n        '[object RegExp]': 'regExp',\n        '[object Undefined]': 'undefined',\n        '[object Null]': 'null',\n        '[object Object]': 'object'\n    };\n    if (obj instanceof Element) {\n        return 'element';\n    }\n    return map[toString.call(obj)];\n}\n\nfunction deepClone(data) {\n    var type = getType(data);\n    var obj;\n    if (type === 'array') {\n        obj = [];\n    } else if (type === 'object') {\n        obj = {};\n    } else {\n        //不再具有下一层次\n        return data;\n    }\n    if (type === 'array') {\n        for (var i = 0, len = data.length; i < len; i++) {\n            obj.push(deepClone(data[i]));\n        }\n    } else if (type === 'object') {\n        for (var key in data) {\n            obj[key] = deepClone(data[key]);\n        }\n    }\n    return obj;\n}\n\nvar extend = function extend(o, n) {\n    for (var p in n) {\n        if (n.hasOwnProperty(p) && !o.hasOwnProperty(p)) o[p] = n[p];\n    }\n};\n\nvar arrMerge = function arrMerge(a, b) {\n    a.push.apply(a, b);\n};\n\nvar support_list = [\"resize\", \"load\", \"click\", \"dblclick\", \"change\", \"blur\", \"focus\", \"keydown\", \"keyup\", \"mousedown\", \"mousemove\", \"mouseout\", \"mouseover\", \"mouseup\", \"select\", \"keypress\"];\n\nvar GetAttrElement = function GetAttrElement(attr, val) {\n    var e = document.all;\n    var a = new Array();\n    for (var i = 0; i < e.length; i++) {\n        if (e[i].getAttribute(attr) == val) {\n            a.push(e[i]);\n        }\n    }\n    return a;\n};\n\nmodule.exports = {\n    deepClone: deepClone,\n    extend: extend,\n    arrMerge: arrMerge,\n    ev_supList: support_list,\n    GetAttrElement: GetAttrElement\n};\n\n//# sourceURL=webpack:///./src/util/util.js?");

/***/ })

/******/ });