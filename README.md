# PodJs
web MVVM framework

<a href="https://zhzLuke96.github.io/PoiJs"> read more...</a>

# Usage
https://zhzLuke96.github.io/PoiJs

# Todo
- [x] review
- [x] time-slicing
- [x] gh-pages
- [x] diff-Refactoring
- [ ] slots on template
- [ ] unit test
- [ ] typescript

# time slice
![before](/docs/bad_slice.png)

(阻塞了paint和事件捕获)
> 这个版本有个小问题...多次emit重绘操作，不过并不妨碍对比(可以算成4次重绘)

![after](/docs/time_slicing.png)

(异步diff异步渲染VM)
> 很明显，diff效率慢了一些，还吞了事件，不过确实解决了阻塞的问题，看上去和异步渲染无异(了吧...)
> <br>无法高效的处理并发的问题，其实很多diff可以不用全部跑完，之后会尝试引入中断的方法来解决看看(没有Vdom真的写得头大)
> <br>RIC会莫名被空闲阻塞(感觉机制上是在后台运行或者没有操作的页面都会被判别为非空闲状态)...现在换用RAF了

# 其他
- 其实一直想重构/写，又一直没动手，现在看了下，很多写的实在太奇怪了...
- diff算法其实可以用，但是还是有点拖累整体，没用vdom优化起来很复杂...唯一有希望的就是用time-slice来解决（然而只是能让ui看上去不卡...治标不治本啊）
- 模板引擎会改造成类似ECS的一套系统，从减少工作量出发，下一个修改将把所有attr功能下放到core之外
- typescript其实不是特别必要，毕竟就是自己玩玩，工程化就靠注释就行了嘛
- have fun
