/**
 * 其实问题就是：
 * javascript如何实现自定义事件也就是合成事件
 * 事件就是典型的发布订阅
 * 发布通过 window.dispatchEvent 
 * 事件名有new Event(type)生成
 * 订阅就是window.addEventListener
 */


function listener(type) {
    const origin = window.history[type]
    return function () {
        const e = new Event(type)
        const res = origin.apply(this, arguments)
        window.dispatchEvent(e)
        return res
    }
}

window.history['pushState'] = listener('pushState')
window.history['replaceState'] = listener('replaceState')






