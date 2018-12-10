// 很奇怪的做法，主要是为了实现time slice，
// 将主体为生成器的task化为promise，
// 从而支持await和async
// @more: https://www.w3.org/TR/requestidlecallback/

var reqIdleFrame = ((window) => {
    // return window.requestIdleCallback || function(cb) {
    return function(cb) {
        var start = Date.now();
        return setTimeout(function() {
            cb({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 16.6 - (Date.now() - start));
                },
            });
        }, 1);
    };
})(window);

var cancelFrame = ((window) => {
    // return window.cancelIdleCallback || (id => clearTimeout(id));
    return id => clearTimeout(id);
})(window);

export function frameify(gen, _Int_) {
    return new Promise((resolve, reject) => {
        var frameid;
        _Int_.clear = () => {
            // Interrupt
            cancelFrame(frameid);
            // console.log("clear", frameid)
            resolve(void 0);
            return void 0;
        }

        function inner() {
            frameid = reqIdleFrame((deadline) => {
                while (deadline.timeRemaining() > 5) {
                    var n = gen.next();
                    if (n.done) {
                        resolve(n.value);
                        return void 0;
                    }
                }
                inner();
            },{timeout:50})
        }
        try {
            inner()
        } catch (e) {
            reject(e)
        }
    })
}
