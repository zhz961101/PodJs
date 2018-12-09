// 很奇怪的做法，主要是为了实现time slice，
// 将主体为生成器的task化为promise，
// 从而支持await和async

var reqIdleFrame = ((window) => {
    return window.requestIdleCallback || function(cb) {
        var start = Date.now();
        return setTimeout(function() {
            cb({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start));
                },
            });
        }, 1);
    };
})(window);

export function frameify(gen) {
    return new Promise((resolve, reject) => {
        function inner() {
            reqIdleFrame((deadline) => {
                while (deadline.timeRemaining() > 0) {
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
