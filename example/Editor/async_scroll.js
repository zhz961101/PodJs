
function aScroll(e1,e2){
    let over1 = false,over2 = false,
        scale = 0;
    const roll = ele=> ele.scrollTop = (ele.scrollHeight-ele.clientHeight)*scale
    const getScale = ele => ele.scrollTop/(ele.scrollHeight-ele.clientHeight)
    e1.addEventListener("mouseover",()=>{
        over1=true;
        over2=false;
    })
    e2.addEventListener("mouseover",()=>{
        over2=true;
        over1=false;
    })
    e1.addEventListener("scroll",e=>{
        if(!over1)return
        scale = getScale(e.target)
        roll(e2)
    })
    e2.addEventListener("scroll",e=>{
        if(!over2)return
        scale = getScale(e.target)
        roll(e1)
    })
}

