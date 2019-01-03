// 很奇怪的做法，主要是为了实现time slice，
// 将主体为生成器的task化为promise，
// 从而支持await和async
// @more: https://www.w3.org/TR/requestidlecallback/


// const K1 = .1, K2 = .1, K3 = .1;
// const samplen = 5;
// // PID coefficient

// function autoCheckStepGap(){
//     // 据调研结果，16ms~30ms探测一回是坠吼的
//     let last = Date.now();
//     let roundE = [];
//     let roundS = () => roundE.length == 0 ? 0 :roundE.reduce((s,v)=>s+v) / roundE.length
//     function appendRound(e){
//         if(roundE.length > samplen)roundE.pop()
//         roundE.unshift(e)
//     }
//     let timeError = (usetime) =>{
//         if(usetime > 16 && usetime < 30)return 0
//         if(usetime < 16)return usetime - 16 // ngetive
//         return usetime - 36
//     }
//     let lastE = 0;
//     return function(usetime){
//         usetime = usetime || Date.now()-last
//         let e = -timeError(usetime)
//         appendRound(e)
//         // let p = K1 * e
//         // let i = K2 * roundS()
//         // let d = usetime == 0 ? 0 : K3 * ((e-lastE)/usetime)
//         // lastE = e
//         // timeCheckStepGap = timeCheckStepGap * (p+i+d)
//         // // console.log("pid",p,i,d)
//         timeCheckStepGap += roundS() * .1
//         if(timeCheckStepGap <= 0)timeCheckStepGap = 1
//         if(timeCheckStepGap >= 50)timeCheckStepGap = 45
//         console.log("new!",usetime,timeCheckStepGap)
//         last = Date.now();
//     }
// }
const TARGET_CHECK_GAP = 17 // 17 => 60fps ;33 => 30fps
function autoCheckGap(){
    let start = Date.now()
    return function(){
        let gap = Date.now() - start
        if(gap > TARGET_CHECK_GAP /** ms */)return 1
        return gap == 0 ? TARGET_CHECK_GAP : (TARGET_CHECK_GAP / gap) // 保证轮询频率为60fps
    }
}

var reqFrame = ((window) => {
    // 每帧50ms
    // * 本来按照常识，这里是很适合idlecallback的，
    //   当然，之前也是那么写的，不过现在，如你所见
    //   我将每帧定义在50ms内
    //   不仅减少不必要的调用，也不用关心idle是怎么实现的
    //   比如chrome的idle会因为鼠标闲置而被block...?!?
    //   实在没弄懂为什么是这种行为...
    //   不过现在已经不用担心了~
    //
    const rF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        ((fn)=>setTimeout(fn,1))
    return function(cb) {
        let start = Date.now();
        return rF(function() {
            cb({
                timeRemaining() {
                    return 50 - (Date.now() - start);
                },
            });
        });
    };
})(window);

var cancelFrame = ((window) => {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        (id => clearTimeout(id));
    // return (id => clearTimeout(id));
})(window);

export function frameify(gen, _Int_) {
    return new Promise((resolve, reject) => {
        let frameid,localCheckGap = 1;
        let GapSeted = false,autoGap;
        if (_Int_) _Int_.clear = () => {
            // Interrupt
            cancelFrame(frameid);
            // console.log("clear", frameid)
            resolve(void 0);
            return void 0;
        }
        
        try {
            inner()
        } catch (e) {
            reject(e)
        }

        function inner() {
            frameid = reqFrame((deadline) => {
                let count = 0;
                while (true) {
                    count = (count + 1) % localCheckGap
                    if(count == localCheckGap - 1){
                        if(deadline.timeRemaining() < 0){
                            break
                        }
                    }
                    if(!GapSeted){
                        if(autoGap){
                            localCheckGap = autoGap()
                            autoGap = null; //GC
                            GapSeted = true;
                        }else{
                            autoGap = autoCheckGap()
                        }
                    }
                    var n = gen.next();
                    if (n.done) {
                        resolve(n.value);
                        return void 0;
                    }
                }
                inner();
            })
        }
    })
}
