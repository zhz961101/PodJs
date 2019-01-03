
// 因为浏览器环境中属性名是大小写不敏感的，
// 如果要绑定带有大写的属性或者事件时，将找不到
// 这里用了最暴力的方法（因为这个问题确实莫名其妙，也从来没人谈论它...）直接用了一个转换表

// Because DOM-attr-property names in the browser environment are case insensitive,
// If you want to bind an attribute or event with any uppercase, it will not be able to find it
// The most violent method used here (because this problem is really inexplicable, and no one has ever talked about it...) directly used a conversion table

// 获取浏览器环境里dom中带有大写且非函数的键名
// Get the uppercase and non-function key names in the DOM in the browser environment
// function Roster() {
//     let div = document.createElement("div"),
//         text = document.createTextNode(""),
//         ret = {};
//     for (const prop in div) {
//         if (prop != prop.toLowerCase() && typeof div[prop] != "function")
//             ret[prop.toLowerCase()] = prop
//     }
//     for (const prop in text) {
//         if (prop != prop.toLowerCase() && typeof text[prop] != "function")
//             ret[prop.toLowerCase()] = prop
//     }
//     return ret
// }

// Roster (chrome) ==>
// Removed some parameters for internal implementation
// For example, the parameters that are all uppercase are generally invalid.
module.exports = {
    accesskey: "accessKey",
    assignedslot: "assignedSlot",
    // attribute_node: "ATTRIBUTE_NODE",
    attributestylemap: "attributeStyleMap",
    baseuri: "baseURI",
    // cdata_section_node: "CDATA_SECTION_NODE",
    childelementcount: "childElementCount",
    childnodes: "childNodes",
    classlist: "classList",
    classname: "className",
    clientheight: "clientHeight",
    clientleft: "clientLeft",
    clienttop: "clientTop",
    clientwidth: "clientWidth",
    // comment_node: "COMMENT_NODE",
    // contenteditable: "contentEditable",
    // document_fragment_node: "DOCUMENT_FRAGMENT_NODE",
    // document_node: "DOCUMENT_NODE",
    // document_position_contained_by: "DOCUMENT_POSITION_CONTAINED_BY",
    // document_position_contains: "DOCUMENT_POSITION_CONTAINS",
    // document_position_disconnected: "DOCUMENT_POSITION_DISCONNECTED",
    // document_position_following: "DOCUMENT_POSITION_FOLLOWING",
    // document_position_implementation_specific: "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC",
    // document_position_preceding: "DOCUMENT_POSITION_PRECEDING",
    // document_type_node: "DOCUMENT_TYPE_NODE",
    // element_node: "ELEMENT_NODE",
    // entity_node: "ENTITY_NODE",
    // entity_reference_node: "ENTITY_REFERENCE_NODE",
    firstchild: "firstChild",
    firstelementchild: "firstElementChild",
    innerhtml: "innerHTML",
    innertext: "innerText",
    inputmode: "inputMode",
    isconnected: "isConnected",
    iscontenteditable: "isContentEditable",
    lastchild: "lastChild",
    lastelementchild: "lastElementChild",
    localname: "localName",
    namespaceuri: "namespaceURI",
    nextelementsibling: "nextElementSibling",
    nextsibling: "nextSibling",
    nodename: "nodeName",
    nodetype: "nodeType",
    nodevalue: "nodeValue",
    // notation_node: "NOTATION_NODE",
    offsetheight: "offsetHeight",
    offsetleft: "offsetLeft",
    offsetparent: "offsetParent",
    offsettop: "offsetTop",
    offsetwidth: "offsetWidth",
    outerhtml: "outerHTML",
    outertext: "outerText",
    ownerdocument: "ownerDocument",
    parentelement: "parentElement",
    parentnode: "parentNode",
    previouselementsibling: "previousElementSibling",
    previoussibling: "previousSibling",
    // processing_instruction_node: "PROCESSING_INSTRUCTION_NODE",
    scrollheight: "scrollHeight",
    scrollleft: "scrollLeft",
    scrolltop: "scrollTop",
    scrollwidth: "scrollWidth",
    shadowroot: "shadowRoot",
    tabindex: "tabIndex",
    tagname: "tagName",
    // text_node: "TEXT_NODE",
    textcontent: "textContent",
    wholetext: "wholeText"
}