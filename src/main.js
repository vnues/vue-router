import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: function (h) { return h(App) },
  beforeCreate() {
    console.log("执行2")
    console.log("beforeCreate", this)
    console.log("this.$options", this.$options)
  },
  created() {
    console.log("created", this)
    console.log("this.$options", this.$options)
  },
}).$mount('#app')