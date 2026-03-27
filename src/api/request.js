import axios from 'axios'
import { useUserStore } from '@/store/user'
import router from '@/router'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

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
    const originalRequest = error.config
    if (error.response?.status === 401 && userStore.refreshToken && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await userStore.refresh()
        originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`
        return request(originalRequest)
      } catch (_) {
        userStore.reset()
        router.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default request
