import Vue from "vue";
import VueRouter from "vue-router";
//import store from "../store";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Homework from "../views/Homework.vue";
import HomeworkView from "../views/HomeworkView.vue";
import ChangePassword from "../views/ChangePassword.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/Login",
    name: "Login",
    component: Login
  },
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      requireAuth: true
    }
  },
  {
    path: "/:studentId/doHomework/:homeworkId",
    name: "Homework",
    component: Homework,
    meta: {
      requireAuth: true
    }
    
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: () =>
    //import( webpackChunkName: "about" */ //"../views/Homework.vue")
  },
  {
    path: "/:studentId/View/:homeworkId",
    name: "HomeworkView",
    component: HomeworkView,
    meta: {
      requireAuth: true
    }
  },
  {
    path: "/ChangePassword",
    name: "ChangePassword",
    component: ChangePassword,
    meta: {
      requireAuth: true
    }
  }
];

const router = new VueRouter({
  routes
});

// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
router.beforeEach((to, from, next) => {  
  if (to.meta.requireAuth) {    
    if (window.localStorage.getItem('token')/*store.state.token*/) {
      next();
    }
    else {
      next({
        path: '/Login',
        query: { redirect: to.fullPath }
      })
    }
  }
  else {
    next();
  }
})

export default router;
