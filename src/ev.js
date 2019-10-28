
class pEvent {
    constructor(){
        this._events = {};
    }
    /**
     * 绑定事件
     * 
     * @param {String} type 事件类型
     * @param {Function} fn 事件处理函数
     * @param {Object} scope 要为事件处理函数绑定的执行上下文
     * @returns 当前实例对象
     */
    listen(type, fn, scope) {
        if (type + '' !== type) {
            console && console.error && console.error('the first argument type is requird as string');
            return this;
        }
        if (typeof fn != 'function') {
            console && console.error && console.error('the second argument fn is requird as function');
            return this;
        }
        type = type.toLowerCase();

        if (!this._events[type]) {
            this._events[type] = [];
        }
        this._events[type].push(scope ? [fn, scope] : [fn]);

        return this;
    }
    /**
     * 触发事件
     * 
     * @param {String} type 触发事件的名称
     * @param {Anything} data 要额外传递的数据,事件处理函数参数如下
     * event = {
            // 事件类型 type: type,
            // 绑定的源，始终为当前实例对象 origin: this,
            // 事件处理函数中的执行上下文 为 this 或用户指定的上下文对象 scope :this/scope
            // 其他数据 为fire时传递的数据
        }
     * @returns 事件对象
     */
    fire(type, data) {
        type = type.toLowerCase();
        var eventArr = this._events[type];
        var fn, scope,
            event = Object.assign({
                // 事件类型
                type: type,
                // 绑定的源
                origin: this,
                // scope 为 this 或用户指定的上下文，
                // 是否取消
                cancel: false
            }, data);

        if (!eventArr) return event;

        for (var i = 0, l = eventArr.length; i < l; ++i) {
            fn = eventArr[i][0];
            scope = eventArr[i][1];
            if (scope) {
                event.scope = scope;
                fn.call(scope, event);
            } else {
                event.scope = this;
                fn(event);
            }
        }
        return event;
    }
    /**
     * 取消绑定一个事件
     * 
     * @param {String} type 取消绑定的事件名称
     * @param {Function} fn 要取消绑定的事件处理函数，不指定则移除当前事件类型下的全部处理函数
     * @returns 当前实例对象
     */
    off(type, fn) {
        type = type.toLowerCase();
        var eventArr = this._events[type];
        if (!eventArr || !eventArr.length) return this;
        if (!fn) {
            this._events[type] = eventArr = [];
        } else {
            for (var i = 0; i < eventArr.length; ++i) {
                if (fn === eventArr[i][0]) {
                    eventArr.splice(i, 1);
                    // 1、找到后不能立即 break 可能存在一个事件一个函数绑定多次的情况
                    // 删除后数组改变，下一个仍然需要遍历处理！
                    --i;
                }
            }
        }
        return this;
    }
    /**
     * 绑定一个只执行一次的事件
     * 
     * @param {String} type 事件类型
     * @param {Function} fn 事件处理函数
     * @param {Object} scope 要为事件处理函数绑定的执行上下文
     * @returns 当前实例对象
     */
    once(type, fn, scope) {
        var that = this;

        function nfn() {
            // 执行时 先取消绑定
            that.off(type, nfn);
            // 再执行函数
            fn.apply(scope || that, arguments);
        }
        this.on(type, nfn, scope);
        return this;
    }
}

module.exports = {

}