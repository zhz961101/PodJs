const Poi = require("./Poi.js");
const EventObj = require("./event.js");
const TplEng = require("./template.js");
const Jsvm = require("./util/JsVm.js");

Poi.__TEST__ = {
    ev: (() => {
        let evobj = new EventObj(document);
        evobj.on("__TEST__", () => {
            console.log("event manger is working!")
        })
        return evobj;
    })(),
    tpl: (_t, _d) => {
        return new TplEng(_t).joint(_d || {});
    },
    vm: Jsvm
};
window.Poi = Poi;

let usage = () => {
    if (console) {
        let msg = `
        thx for u using!!!!poi~

        now,poi is working!
        you can use the following instructions to do a few simple tests of functional integrity:

        >> Poi.__TEST__.tpl("<% console.log('getcha') %>",{console:console})
        >> Poi.__TEST__.ev.emit("__TEST__")
        >> Poi.__TEST__.vm.safe("console.log(msg)",{msg:"yahoo!"})
        `;
        console.log(msg);
    }
}
usage();
