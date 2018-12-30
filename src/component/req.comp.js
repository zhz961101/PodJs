const {
    creatCustomEle,
    tplLoader
} = require("./component")
const {
    domApi
} = require("../util/domapi.js");

const eleTagName = "p-require"

module.exports = function requireEleInit(){
    function readTextFile(file, callback){
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function (){
            if(rawFile.readyState === 4){
                if(rawFile.status === 200 || rawFile.status == 0){
                    var allText = rawFile.responseText;
                    callback(allText)
                }
            }
        }
        rawFile.send(null);
    }
    function readText(url){
        return new Promise((reslove,reject)=>{
            try {
                readTextFile(url,res=>{
                    reslove(res)
                })
            } catch (err) {
                reject(err)
            }
        })
    }
    function appendReqEle(from){
        let $body = domApi.$("body")
        let dom = domApi.createDom(`<${eleTagName} from="${from}"></${eleTagName}>`)
        domApi.append(dom,$body)
    }
    creatCustomEle(eleTagName,"<style>:host{display:none;}</style>",{
        init() {
            if(this.getAttribute("from")){
                readText(this.getAttribute("from"))
                .then(text=>tplLoader(text))
            }else if(this.getAttribute("fromOf")){
                let reqLs = this.getAttribute("fromOf").trim().split(";").map(v=>v.trim())
                for (const from of reqLs) {
                    if(from == "")continue
                    appendReqEle(from)
                }
            }
        }
    })
}
