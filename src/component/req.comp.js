const {
    creatCustomEle,
    tplLoader
} = require("./component")

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
    creatCustomEle(eleTagName,"<style>:host{display:none;}</style>",{
        init() {
            readText(this.getAttribute("from"))
                .then(text=>tplLoader(text))
        }
    })
}
