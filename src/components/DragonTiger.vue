<template>
  <div class="min-h-screen bg-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden relative z-10">
      <!-- 头部区域 -->
      <div class="bg-gradient-to-r from-red-600 to-yellow-600 p-4 sm:p-8 text-white relative">
        <router-link
            to="/games"
            class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm sm:text-base"
        >
          返回
        </router-link>

        <button
            @click="showHistory = !showHistory"
            class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm sm:text-base"
        >
          {{ showHistory ? '隐藏' : '显示' }}记录
        </button>

        <h1 class="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-4">龙虎斗</h1>
        <div class="text-center">
          <span class="text-lg sm:text-xl">余额:</span>
          <span class="text-2xl sm:text-4xl font-bold ml-2">{{ authStore.user?.balance }}</span>
          <span class="ml-2">筹码</span>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div class="p-4 sm:p-8">
        <div class="space-y-4 sm:space-y-6">
          <!-- 牌面区域 -->
          <div class="flex justify-center gap-10 sm:gap-20 mb-4 sm:mb-8">
            <DragonTigerAnimation
                :result="result"
                :showCards="!!result && showResult"
                @select-dragon-card="selectedOption = 'dragon'"
                @select-tiger-card="selectedOption = 'tiger'"
            />
          </div>

          <!-- 选择区域 -->
          <div class="flex justify-center gap-2 sm:gap-4 flex-wrap">
            <button
                v-for="option in ['dragon', 'tie', 'tiger']"
                :key="option"
                @click="selectedOption = option"
                :class="[
                'px-4 sm:px-8 py-2 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors',
                selectedOption === option
                  ? option === 'dragon' ? 'bg-red-600 text-white'
                    : option === 'tiger' ? 'bg-yellow-600 text-white'
                    : 'bg-purple-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              ]"
            >
              {{ optionLabels[option] }}
              <span class="block text-xs sm:text-sm">{{ optionMultipliers[option] }}倍</span>
            </button>
          </div>

          <!-- 下注控制区 -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div class="relative w-full sm:w-auto">
              <input
                  type="number"
                  v-model="betAmount"
                  :max="authStore.user?.balance"
                  min="1"
                  class="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                码
              </span>
            </div>
            <button
                @click="placeBet"
                :disabled="!canBet"
                class="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                class="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors text-sm sm:text-base"
            >
              {{ amount }}
            </button>
          </div>

          <!-- 游戏规则 -->
          <div class="mt-6 sm:mt-8 p-4 bg-gray-50 rounded-lg text-sm sm:text-base">
            <h3 class="text-lg font-bold mb-2">游戏规则</h3>
            <ul class="list-disc list-inside space-y-1 text-gray-600">
              <li>龙赢：龙牌点数大于虎牌，赔率 1:2</li>
              <li>虎赢：虎牌点数大于龙牌，赔率 1:2</li>
              <li>和：龙虎牌点数相同，赔率 1:9</li>
              <li>牌面大小：K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2 > A</li>
            </ul>
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
import HistoryPanel from './HistoryPanel.vue'
import ResultMessage from './ResultMessage.vue'
import api from '@/api/axios.js'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import DragonTigerAnimation from './DragonTigerAnimation.vue'

const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()
const { history } = storeToRefs(gameStore)

const betAmount = ref(10)
const result = ref(null)
const selectedOption = ref('dragon')
const isPlaying = ref(false)
const showHistory = ref(false)
const showResult = ref(false)

const optionLabels = {
  dragon: '龙',
  tiger: '虎',
  tie: '和'
}

const optionMultipliers = {
  dragon: 2,
  tiger: 2,
  tie: 9
}

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1
});

onMounted(async () => {
  try {
    await authStore.fetchUser()
    const paginationData = await gameStore.fetchHistory(1);
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
      !isPlaying.value;
})

const placeBet = async () => {
  if (!canBet.value) return;

  isPlaying.value = true;
  result.value = null;

  try {
    const response = await api.post('/api/game/bet/dragon-tiger', {
      amount: Number(betAmount.value),
      selectedOption: selectedOption.value
    });

    const { dragonCard, tigerCard, win, winAmount } = response;

    await authStore.fetchUser();

    result.value = {
      win,
      dragonCard,
      tigerCard,
      amount: betAmount.value,
      winAmount,
      message: win
          ? `你赢得了 ${winAmount} 筹码！`
          : `你输掉了 ${betAmount.value} 筹码！`
    };

    const paginationData = await gameStore.addToHistory({
      gameType: 'dragon-tiger',
      amount: betAmount.value,
      win: Boolean(win),
      finalBalance: String(authStore.user?.balance),
      diceResults: [dragonCard, tigerCard],
      selectedOption: String(selectedOption.value)
    });

    pagination.value = paginationData;
    showResult.value = true;
  } catch (error) {
    console.error('下注失败:', error);
    ElMessage.error(error.response?.data?.error?.message || '下注失败，请重试');
  } finally {
    isPlaying.value = false;
  }
};

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