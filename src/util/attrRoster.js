function Roster() {
    let div = document.createElement("div"),
        text = document.createTextNode(""),
        ret = {};
    for (const prop in div) {
        if (prop != prop.toLowerCase() && typeof div[prop] != "function")
            ret[prop.toLowerCase()] = prop
    }
    for (const prop in text) {
        if (prop != prop.toLowerCase() && typeof text[prop] != "function")
            ret[prop.toLowerCase()] = prop
    }
    return ret
}

// Roster (chrome) ==>

module.exports = {
    accesskey: "accessKey",
    assignedslot: "assignedSlot",
    attribute_node: "ATTRIBUTE_NODE",
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
    notation_node: "NOTATION_NODE",
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