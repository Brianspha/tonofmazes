import Vue from "vue";
import VueRouter from "vue-router";
import GameView from "../views/GameView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "game",
    component: GameView,
  },
  {
    path: "/game",
    name: "gameView",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/GameView.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
