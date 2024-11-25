import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useGameStore = defineStore('game', {
  state: () => ({
    balance: 0,
    history: [],
    loading: false,
    error: null
  }),
  
  actions: {
    // 获取用户余额
    async fetchBalance() {
      try {
        this.loading = true
        const response = await api.get('/api/game/balance')
        this.balance = response.balance
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    
    async updateBalance(amount) {
      try {
        const response = await api.post('/api/game/balance/update', { amount })
        this.balance = response.balance
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    // 获取历史记录
    async fetchHistory(page = 1) {
      try {
        const response = await api.get('/api/game/history', {
          params: { page }
        });
        this.history = response.history;
        return {
          currentPage: response.pagination.currentPage,
          pageSize: response.pagination.pageSize,
          totalItems: response.pagination.totalItems,
          totalPages: response.pagination.totalPages
        };
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },
    
    // 添加新记录
    async addToHistory(record) {
      try {
        await api.post('/api/game/history', record);
        return this.fetchHistory(1);
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    }
  }
}) 