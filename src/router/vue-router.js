class HistoryRoute {
    constructor() {
        this.current = null
    }
}

class VueRouter {
    constructor(options) {
        this.mode = options.mode || 'hash'
        this.routes = options.routes || []
        this.routesMap = this.createMap(this.routes)
        this.history = new HistoryRoute()
        this.init()
        window.history['pushState'] = this.listener('pushState')
        window.history['replaceState'] = this.listener('replaceState')
        window.addEventListener('pushState', () => {
            this.history.current = location.pathname
        })
        window.addEventListener('replaceState', () => {
            this.history.current = location.pathname
        })
    }
    listener(type) {
        const origin = window.history[type]
        return function () {
            const e = new Event(type)
            const res = origin.apply(this, arguments)
            window.dispatchEvent(e)
            return res
        }
    }
    init() {
        if (this.mode === 'hash') {
            /**
             * 先判断用户打开时有没有hash值，没有的话跳转到#/
             */
            location.hash ? '' : location.hash = '/'
            /**
             * 这时应为页面第一次加载完不会触发 hashchange，因而用load事件来监听hash值，再将视图渲染成对应的内容
             */
            window.addEventListener('load', () => {
                this.history.current = location.hash.slice(1)
            })
            window.addEventListener('hashchange', () => {
                this.history.current = location.hash.slice(1)
            })
        } else {
            /**
             * 我们通过监控popstate或者hashChange以及load
             * 一改变我们就去改变我们的响应式数据 响应式数据改变了就去通知依赖 触发更新
             * 而这个url是映射到我们的响应式数据 是一种映射依赖
             */
            location.pathname ? '' : location.pathname = '/'
            window.addEventListener('load', () => {
                this.history.current = location.pathname
            })
            window.addEventListener('popstate', () => {
                this.history.current = location.pathname
            })
        }
    }


    /**
     * 将routes数组处理成对象形式
     */
    createMap(routes) {
        return routes.reduce((acc, cur) => {
            acc[cur.path] = cur.component
            return acc
        }, {})
    }
}

VueRouter.install = function (Vue) {
	/**
	 * 我们是不是在vue组件上这样使用路由API
	 * this.$route this.$router
	 * 所以我们需要把$route和$router挂载到组件上
	 * $router是VueRouter的实例，所有组件共享
	 * 通过mixin注入组件选项
	 */
    Vue.mixin({
        beforeCreate() {
            /**
             * 一、如果是根组件
             * 根组件是下面这个 App也是组件但不是根组件，组件本身其实一个Vue实例
             * new Vue({
             *  router,
             * beforeCreate() {
             *    console.log("beforeCreate", this)
             *   }
             *  render: function (h) { return h(App) }
             *   }).$mount('#app')
             * 二、为什么是beforeCreate而不是created
             * 我们可能在组件中beforeCreate生命周期也会使用this.$router
             * 三、混入同样的生命周期函数
             * 是有一定的执行顺序的 Mixin的先执行
             */
            if (this.$options && this.$options.router) {
                this._root = this
                this._router = this.$options.router
                /**
                 * url改变触发视图更新
                 * 说明这个url是响应式数据 我们要将这个数据变为响应式数据
                 * 要知道 响应式数据自带依赖收集（谁使用了这个数据 我变化了 就通知这个依赖）
                 */
                Vue.util.defineReactive(this, 'current', this._router.history)
            } else {
                this._root = this.$parent && this.$parent._root
            }
            /**
             * 当访问this.$router的时候
             */
            Object.defineProperty(this, '$router', {
                get() {
                    return this._root._router
                }
            })
            /**
             * 当访问this.$route的时候
             */
            Object.defineProperty(this, '$route', {
                get() {
                    return this._root._router.history.current
                }
            })
        },
    });

    /**
     * 创建组件router-link
     */
    Vue.component("router-link", {
        props: {
            to: String
        },
        render(h) {
            /**
             * render函数内部的this指向Proxy实例
             */
            const mode = this._self._root._router.history.mode
            let to = mode === "hash" ? "#" + this.to : this.to
            const data = { attrs: { href: to } }
            /**
             * 这种on方式我也不知道
             * 专门去翻源码 官方是这样写的
             * 猜测是官方会通过on经过特定的处理
             */
            data.on = {
                click: function (e) {
                    e.preventDefault()
                    if (mode === 'hash') {
                        location.hash = to
                    } else {
                        history.pushState(null, '', to)
                        console.log(location.pathname)
                    }
                }
            }
            return h('a', data, this.$slots.default)
        },
    });


    /**
     * 创建组件router-view
     */
    Vue.component("router-view", {
        render(h) {
            /**
             * render函数内部的this指向Proxy实例
             */
            const current = this._self._root._router.history.current
            const routesMap = this._self._root._router.routesMap
            return h(routesMap[current]);
        },
    });
};

export default VueRouter;
