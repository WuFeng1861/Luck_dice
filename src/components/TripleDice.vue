<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden relative z-10">
      <!-- 头部区域 -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white relative">
        <router-link 
          to="/games"
          class="absolute left-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
        >
          返回
        </router-link>

        <button 
          @click="showHistory = !showHistory"
          class="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
        >
          {{ showHistory ? '隐藏' : '显示' }}记录
        </button>

        <h1 class="text-3xl font-bold text-center mb-4">三倍幸运骰子</h1>
        <div class="text-center">
          <span class="text-xl">余额:</span>
          <span class="text-4xl font-bold ml-2">{{ authStore.user?.balance }}</span>
          <span class="ml-2">筹码</span>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div class="p-8">
        <div class="space-y-6">
          <!-- 骰子区域 -->
          <div class="flex justify-center gap-8 mb-8">
            <ThreeDice v-for="(dice, index) in 3" :key="index" ref="diceRefs" />
          </div>

          <!-- 选择区域 -->
          <div class="flex flex-wrap justify-center gap-4 mb-6">
            <!-- 基础选项 -->
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-center text-gray-700">基础玩法</h3>
              <div class="flex gap-4">
                <button 
                  v-for="option in ['big', 'middle', 'small']" 
                  :key="option"
                  @click="selectedOption = option"
                  :class="[
                    'px-6 py-3 rounded-lg font-bold text-lg transition-colors',
                    selectedOption === option 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  ]"
                >
                  {{ optionLabels[option] }}
                  <span class="block text-sm">{{ optionMultipliers[option] }}倍</span>
                </button>
              </div>
            </div>

            <!-- 特殊选项 -->
            <div class="space-y-4">
              <h3 class="text-lg font-bold text-center text-gray-700">特殊玩法</h3>
              <div class="flex gap-4">
                <button 
                  v-for="option in ['triple', 'pair', 'straight']" 
                  :key="option"
                  @click="selectedOption = option"
                  :class="[
                    'px-6 py-3 rounded-lg font-bold text-lg transition-colors',
                    selectedOption === option 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  ]"
                >
                  {{ optionLabels[option] }}
                  <span class="block text-sm">{{ optionMultipliers[option] }}倍</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 下注控制区 -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div class="relative">
              <input 
                type="number" 
                v-model="betAmount"
                :max="authStore.user?.balance"
                min="1"
                class="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                码
              </span>
            </div>
            <button 
              @click="placeBet"
              :disabled="!canBet"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下注
            </button>
          </div>

          <!-- 快速下注按钮 -->
          <div class="flex justify-center gap-2 flex-wrap">
            <button 
              v-for="amount in [10, 50, 100, 500]" 
              :key="amount"
              @click="betAmount = amount"
              class="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              {{ amount }}
            </button>
          </div>

          <!-- 游戏规则 -->
          <div class="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-lg font-bold mb-2">游戏规则</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-bold mb-2">基础玩法</h4>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>大：总点数 > 11，赔率 1:2</li>
                  <li>小：总点数 < 10，赔率 1:2</li>
                  <li>中：总点数 10-11，赔率 1:3</li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold mb-2">特殊玩法</h4>
                <ul class="list-disc list-inside space-y-1 text-gray-600">
                  <li>豹子：三个相同点数，赔率 1:30</li>
                  <li>对子：任意两个相同点数，赔率 1:5</li>
                  <li>顺子：三个连续点数，赔率 1:10</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录面板 -->
    <HistoryPanel
      v-model="showHistory"
      :history="history"
      :pagination="pagination"
      @page-change="handlePageChange"
    />

    <!-- 结果提示框 -->
    <ResultMessage
      v-model:show="showResult"
      :result="result"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import ThreeDice from './ThreeDice.vue'
import HistoryPanel from './HistoryPanel.vue'
import ResultMessage from './ResultMessage.vue'
import api from '@/api/axios.js'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()
const { history } = storeToRefs(gameStore)

const diceRefs = ref([])
const betAmount = ref(10)
const result = ref(null)
const selectedOption = ref('big')
const isRolling = ref(false)
const showHistory = ref(false)
const showResult = ref(false)

const optionLabels = {
  big: '大',
  middle: '中',
  small: '小',
  triple: '豹子',
  pair: '对子',
  straight: '顺子'
}

const optionMultipliers = {
  big: 1.8,
  middle: 4,
  small: 1.8,
  triple: 30,
  pair: 2,
  straight: 6
}

// 在 script setup 中添加分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1
});

onMounted(async () => {
  try {
    await authStore.fetchUser()
    const paginationData = await gameStore.fetchHistory(1); // 获取第一页数据
    pagination.value = paginationData;
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('获取信息失败，请重新登录')
    router.push('/login')
  }
})

const canBet = computed(() => {
  return betAmount.value > 0 && 
         betAmount.value <= authStore.user?.balance && 
         selectedOption.value && 
         !isRolling.value;
})

const placeBet = async () => {
  if (!canBet.value) return;
  
  isRolling.value = true;
  result.value = null;
  
  try {
    const response = await api.post('/api/game/bet/triple', {
      amount: Number(betAmount.value),
      selectedOption: selectedOption.value
    });
    
    const { diceResults, sum, win, winAmount } = response;
    
    // 播放骰子动画
    await Promise.all(diceRefs.value.map((dice, index) => 
      dice.rollDice(diceResults[index])
    ));
    
    // 更新用户信息
    await authStore.fetchUser();
    
    // 设置结果
    result.value = {
      win,
      diceResults,
      sum,
      amount: betAmount.value,
      winAmount,
      message: win 
        ? `点数总和 ${sum}！你赢得了 ${winAmount} 筹码！`
        : `点数总和 ${sum}！你输掉了 ${betAmount.value} 筹码！`
    };

    // 添加调试日志
    console.log('Adding history with data:', {
      gameType: 'triple',
      amount: betAmount.value,
      win,
      finalBalance: authStore.user?.balance,
      diceResults,
      selectedOption: selectedOption.value
    });

    // 添加到历史记录并获取更新后的分页数据
    const paginationData = await gameStore.addToHistory({
      gameType: 'triple',
      amount: betAmount.value,
      win: Boolean(win),  // 确保是布尔值
      finalBalance: String(authStore.user?.balance),  // 确保是字符串
      diceResults: Array.isArray(diceResults) ? diceResults : [],  // 确保是数组
      selectedOption: String(selectedOption.value)  // 确保是字符串
    });

    // 更新分页数据
    pagination.value = paginationData;
    showResult.value = true;
  } catch (error) {
    console.error('下注失败:', error);
    ElMessage.error(error.response?.data?.error?.message || '下注失败，请重试');
  } finally {
    isRolling.value = false;
  }
};

// 处理页面变化
const handlePageChange = async (page) => {
  try {
    const paginationData = await gameStore.fetchHistory(page);
    pagination.value = paginationData;
  } catch (error) {
    console.error('获取历史记录失败:', error);
    ElMessage.error('获取历史记录失败');
  }
};
</script>

<style scoped>
/* ... 样式保持不变 ... */
</style> 