import axios from 'axios'
import {useAuthStore} from "@/stores/auth.js";

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      // 确保 headers 对象存在
      config.headers = config.headers || {}
      // 设置认证头
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    // 如果是 401 错误，可能是 token 过期
    if (error.response?.status === 401) {
        // 处理未授权情况
        const authStore = useAuthStore()
        authStore.logout()
    }
    return Promise.reject(error)
  }
)

export default api 