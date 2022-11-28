import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import vueAwesomeCountdown from "vue-awesome-countdown";
import vuetify from "./plugins/vuetify";
Vue.use(vueAwesomeCountdown, "vac");
Vue.config.productionTip = false;
new Vue({
  store,
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
