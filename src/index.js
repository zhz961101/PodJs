import "regenerator-runtime";

const req_ele_init = require("./component/req.comp")
const Poi = require("./Poi");

function poi_init(){
    if(typeof window != 'undefined')window.Poi = Poi
    try {
        req_ele_init()
    } catch (err) {
        console.warn(err)
    }
    if (console) {
        console.log(`
        poi~
        thx for u using!!!!
        PoiJs is working!have fun.
    
        gitpage: https://zhzluke96.github.io/PoiJs/`);
    }
}

poi_init()