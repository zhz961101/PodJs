import "regenerator-runtime";

const Poi = require("./core/Poi");
// const EventObj = require("./core/event");
// const TplEng = require("./core/template");
// const Jsvm = require("./util/JsVm");

// Poi.__TEST__ = {
//     ev: (() => {
//         let evobj = new EventObj(document);
//         evobj.on("__TEST__", () => {
//             console.log("event manger is working!")
//         })
//         return evobj;
//     })(),
//     tpl: (_t, _d) => {
//         return new TplEng(_t).joint(_d || {});
//     },
//     vm: Jsvm
// };
if(typeof window != 'undefined')window.Poi = Poi

let usage = () => {
    if (console) {
        let msg = `
        thx for u using!!!!poi~

        now,poi is working!have fun.
        `;
        console.log(msg);
    }
}
usage();
