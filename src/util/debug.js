
let debugObj = function(tag){
    this.tag = tag || ""
    console.time(tag);
    let grouplog = ()=>{
        console.group("debug_"+this.tag)
        console.timeEnd(tag);
        console.trace()
        console.groupEnd();
    }
    this.log=function(){
        // console.log(this.tag)
        grouplog()
        console.time(tag);
    }
    this.end=grouplog;
}

module.exports = debugObj
