import request from './request'

export function loginApi(data) {
  return request.post('/auth/login', data)
}

export function refreshApi(refreshToken) {
  return request.post('/auth/refresh', { refreshToken })
}

export function profileApi() {
  return request.get('/auth/profile')
}

export function logoutApi() {
  return request.post('/auth/logout')
}
