# 特性
这里展示并暴露一些新特性的问题

# Todo
- [x] review
- [x] time-slicing
- [x] gh-pages
- [x] diff-Refactoring
- [ ] more diff option, more ingenious design
- [ ] ESC-mode-tpl
- [ ] unit test
- [ ] typescript

# template
template callee

...

# time slice
![before](/docs/bad_slice.png)

(阻塞了paint和事件捕获)
> 这个版本有个小问题...多次emit重绘操作，不过并不妨碍对比(可以算成4次重绘)

![after](/docs/time_slicing.png)

(异步diff异步渲染VM)
> 很明显，diff效率慢了一些，还吞了事件，不过确实解决了阻塞的问题，看上去和异步渲染无异(了吧...)
> <br>无法高效的处理并发的问题，其实很多diff可以不用全部跑完，之后会尝试引入中断的方法来解决看看(没有Vdom真的写得头大)
> <br>RIC会莫名被空闲阻塞(感觉机制上是在后台运行或者没有操作的页面都会被判别为非空闲状态)...现在换用RAF了

# async render
对于diff比较慢的树，在diff过程中可能会面临还没diff完下一次的diff就进入协程队列中，我用了一种简单的中断控制来优化这个过程

 > 当然简单是有代价的，常见的如果你想用死循环来控制一个dom树更新（game loop），code前你必须调查这个树的普遍渲染时延，并在每次循环后延迟一下，给异步队列一点时间，不然将永远显示不出来（不过数据是会更新的）
 > <br>针对这个问题，之后会提供一个新接口 nextRender (计划中)

逻辑比较粗暴，只要有新渲染，就通知前一个渲染停止并让步（有个问题就是其协程维护是每个对象自己维护自己，多协程并发也许会引发不可控问题）

如果想测试效果的话，可以看example目录中的[CAxx demo](https://zhzLuke96.github.io/PoiJs/example/ca/CAxx.html)

> 更一般的，可以通过$data直接多次调用函数，并watch变化的量，它会表现为，多次修改，但是只渲染最后一次
><br>（深入内部的话，调用栈则会表现为多次调用diff并在1ms以内又被clear）


# 其他
- 其实一直想重构/写，又一直没动手，现在看了下，很多写的实在太奇怪了...
- diff算法其实可以用，但是还是有点拖累整体，没用vdom优化起来很复杂...唯一有希望的就是用time-slice来解决（然而只是能让ui看上去不卡...治标不治本啊）
- 模板引擎会改造成类似ECS的一套系统，从减少工作量出发，下一个修改将把所有attr功能下放到core之外
- typescript其实不是特别必要，毕竟就是自己玩玩，工程化就靠注释就行了嘛
- have fun

> 一个奇怪的bug<br>
> requestidlecallback是个很好的api，但是内部实现很诡异
> <br>本来这是作为空闲调用的主要驱动接口，能最大限度提高ui响应永不阻塞
> <br>但是，idleframe的定义太模糊了，不管是什么文档都没有详细定义(没找到)
> <br>单就chrome而言，鼠标悬停(hit testing 2(or more)times no-response)整个LOOP都会被标记为非空闲，并继而阻塞微任务
> <br>虽然不难理解是一种优化策略，但是这idle又idle啥了呢...我不就是想没操作的时候把次级任务队列跑完吗...
> <br>chrome版本 70.0.3538.110 bit64