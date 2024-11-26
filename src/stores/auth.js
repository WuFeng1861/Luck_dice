import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')),
    token: localStorage.getItem('token'),
    loading: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token
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
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
      }
    },
    
    async fetchUser() {
      try {
        const response = await api.get('/api/auth/user')
        this.user = response
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (error) {
        this.logout()
        throw error
      }
    },

    initAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
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