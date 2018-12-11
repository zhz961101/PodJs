// 很奇怪的做法，主要是为了实现time slice，
// 将主体为生成器的task化为promise，
// 从而支持await和async
// @more: https://www.w3.org/TR/requestidlecallback/

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
        window.mozRequestAnimationFrame;
    if (rF) {
        return function(cb) {
            var start = Date.now();
            return rF(function(call2now) {
                cb({
                    timeRemaining() {
                        return Math.max(0, 50 - (Date.now() - start));
                    },
                });
            });
        };
    }
    // default
    return function(cb) {
        var start = Date.now();
        return setTimeout(function() {
            cb({
                timeRemainingn() {
                    return Math.max(0, 50 - (Date.now() - start));
                },
            });
        }, 1);
    };
})(window);

var cancelFrame = ((window) => {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.mozCancelRequestAnimationFrame || (id => clearTimeout(id));
})(window);

export function frameify(gen, _Int_) {
    return new Promise((resolve, reject) => {
        var frameid;
        if (_Int_) _Int_.clear = () => {
            // Interrupt
            cancelFrame(frameid);
            // console.log("clear", frameid)
            resolve(void 0);
            return void 0;
        }

        function inner() {
            frameid = reqFrame((deadline) => {
                while (deadline.timeRemaining() > 5) {
                    var n = gen.next();
                    if (n.done) {
                        resolve(n.value);
                        return void 0;
                    }
                }
                inner();
            })
        }
        try {
            inner()
        } catch (e) {
            reject(e)
        }
    })
}
