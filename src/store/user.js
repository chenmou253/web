import { defineStore } from 'pinia'
import { loginApi, logoutApi, profileApi, refreshApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    accessToken: localStorage.getItem('access_token') || '',
    refreshToken: localStorage.getItem('refresh_token') || '',
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
    menus: JSON.parse(localStorage.getItem('menus') || '[]'),
    routesReady: false
  }),
  actions: {
    applyAuthPayload(payload) {
      this.userInfo = payload.user || this.userInfo
      this.permissions = payload.permissions || []
      this.menus = payload.menus || []
      if (payload.tokens) {
        this.accessToken = payload.tokens.accessToken
        this.refreshToken = payload.tokens.refreshToken
        localStorage.setItem('access_token', this.accessToken)
        localStorage.setItem('refresh_token', this.refreshToken)
      }
      localStorage.setItem('permissions', JSON.stringify(this.permissions))
      localStorage.setItem('menus', JSON.stringify(this.menus))
    },
    async login(form) {
      const result = await loginApi(form)
      this.applyAuthPayload(result.data)
    },
    async fetchProfile() {
      const result = await profileApi()
      this.applyAuthPayload(result.data)
    },
    async refresh() {
      const result = await refreshApi(this.refreshToken)
      this.applyAuthPayload(result.data)
    },
    async logout() {
      try {
        await logoutApi()
      } finally {
        this.reset()
      }
    },
    reset() {
      this.userInfo = null
      this.accessToken = ''
      this.refreshToken = ''
      this.permissions = []
      this.menus = []
      this.routesReady = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('permissions')
      localStorage.removeItem('menus')
    }
  }
})
