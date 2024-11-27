import { defineStore } from 'pinia'
import api from '@/api/axios.js'

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
        // 打印接收到的原始数据
        console.log('Received record:', record);

        // 确保所有必需字段都有值
        const formattedRecord = {
          gameType: String(record.gameType || ''),
          amount: Number(record.amount || 0),
          win: Boolean(record.win),
          finalBalance: String(record.finalBalance || '0'),
          diceResults: record.diceResults,
          selectedOption: String(record.selectedOption || '')
        };

        // 详细的字段验证
        const missingFields = [];
        if (!formattedRecord.gameType) missingFields.push('gameType');
        if (!formattedRecord.amount) missingFields.push('amount');
        if (formattedRecord.win === undefined) missingFields.push('win');
        if (!formattedRecord.finalBalance) missingFields.push('finalBalance');
        if (!formattedRecord.diceResults) missingFields.push('diceResults');
        if (!formattedRecord.selectedOption) missingFields.push('selectedOption');

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        return this.fetchHistory(1);
      } catch (error) {
        console.error('Add history error:', error);
        this.error = error.message;
        throw error;
      }
    }
  }
}) 