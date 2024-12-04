import { defineStore } from 'pinia'
import api from '@/api/axios.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    token: localStorage.getItem('token'),
    address: localStorage.getItem('address'),
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    hasAddress: (state) => !!state.address
  },

  actions: {
    async register(credentials) {
      try {
        const response = await api.post('/api/auth/register', credentials)
        return response
      } catch (error) {
        throw error
      }
    },

    async login(credentials) {
      try {
        const response = await api.post('/api/auth/login', credentials)
        this.token = response.token
        this.user = response.user
        this.address = response.user.address || null

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        if (this.address) {
          localStorage.setItem('address', this.address)
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await api.post('/api/auth/logout')
      } finally {
        this.token = null
        this.user = null
        this.address = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('address')
        delete api.defaults.headers.common['Authorization']
        window.location.href = '/login'
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/api/auth/user')
        this.user = response
        this.address = response.address || null
        localStorage.setItem('user', JSON.stringify(this.user))
        if (this.address) {
          localStorage.setItem('address', this.address)
        }
      } catch (error) {
        this.logout()
        throw error
      }
    },

    async bindAddress(address) {
      this.address = address
      localStorage.setItem('address', address)
      await this.fetchUser() // Refresh user data after binding
    },

    initAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const address = localStorage.getItem('address')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.address = address
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        this.fetchUser().catch(() => {
          this.logout()
          return false
        })
        return true
      }
      return false
    }
  }
})