import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from './util/http'
import globalVariable from './util/globalVariable'

Vue.config.productionTip = false;
Vue.prototype.commonsVariable = globalVariable;
// 将axios挂载到prototype上，在组件中可以直接使用this.axios访问
Vue.prototype.$axios = axios;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
