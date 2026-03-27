import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

let sessionExpiredHandled = false

request.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.accessToken) {
    config.headers.Authorization = `Bearer ${userStore.accessToken}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const userStore = useUserStore()
    const originalRequest = error.config || {}
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && userStore.refreshToken && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true
      try {
        await userStore.refresh()
        originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`
        return request(originalRequest)
      } catch (_) {
        if (!sessionExpiredHandled) {
          sessionExpiredHandled = true
          ElMessage.error('账号已在其他设备登录，请重新登录')
        }
        userStore.reset()
        router.replace('/login')
      }
    }

    if (error.response?.status === 401 && isRefreshRequest) {
      if (!sessionExpiredHandled) {
        sessionExpiredHandled = true
        ElMessage.error('账号已在其他设备登录，请重新登录')
      }
      userStore.reset()
      router.replace('/login')
    }

    return Promise.reject(error)
  }
)

router.afterEach((to) => {
  if (to.path === '/login') {
    sessionExpiredHandled = false
  }
})

export default request
