
// init require
require("./req.comp")();

if(typeof window == "undefined"){
    // node
    module.exports = require("./component")
}else{
    // browser
    window.component = require("./component")
}
