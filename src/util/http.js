import axios from 'axios'
import store from '../store'
import router from '../router'

// axios 配置
//https://github.com/superman66/vue-axios-github
axios.defaults.timeout = 5000
//axios.defaults.baseURL = 'https://api.github.com'

// http request 拦截器
axios.interceptors.request.use(
  config => {
    if (window.localStorage.token) {
      config.headers.Authorization = `${store.state.token}`
    }
    return config
  },
  err => {
    return Promise.reject(err)
  },
)

// http response 拦截器
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 401 清除token信息并跳转到登录页面
          store.commit("logout")
          
          // 只有在当前路由不是登录页面才跳转
          router.currentRoute.path !== 'Login' &&
            router.replace({
              path: 'Login',
              query: { redirect: router.currentRoute.path },
            })
      }
    }
    // console.log(JSON.stringify(error));//console : Error: Request failed with status code 402
    return Promise.reject(error.response.data)
  },
)

export default axios