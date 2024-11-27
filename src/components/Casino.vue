<template>
  <div class="min-h-screen bg-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
    <!-- 主游戏区域 -->
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden relative z-10">
      <!-- 头部区域 -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-8 text-white relative">
        <!-- 返回按钮 -->
        <router-link
            to="/games"
            class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm sm:text-base"
        >
          返回
        </router-link>

        <!-- 显示/隐藏按钮 -->
        <button
            @click="showHistory = !showHistory"
            class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-sm sm:text-base"
        >
          {{ showHistory ? '隐藏' : '显示' }}记录
        </button>

        <h1 class="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-4">骰子游戏</h1>
        <div class="text-center">
          <span class="text-lg sm:text-xl">余额:</span>
          <span class="text-2xl sm:text-4xl font-bold ml-2">{{ authStore.user?.balance }}</span>
          <span class="ml-2">筹码</span>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div class="p-4 sm:p-8">
        <div class="space-y-4 sm:space-y-6">
          <!-- 骰子区域 -->
          <div class="mb-4 sm:mb-8">
            <ThreeDice ref="diceRef" />
          </div>

          <!-- 选择面数 -->
          <div class="flex justify-center gap-1 sm:gap-2 flex-wrap mb-4 sm:mb-6">
            <button
                v-for="face in 6"
                :key="face"
                @click="selectedFace = face"
                :class="[
                'w-10 sm:w-12 h-10 sm:h-12 rounded-full text-base sm:text-lg font-bold transition-colors',
                selectedFace === face
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              ]"
            >
              {{ face }}
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
                  class="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                筹码
              </span>
            </div>
            <button
                @click="placeBet"
                :disabled="!canBet"
                class="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

          <!-- 结果显示 -->
          <div
              v-if="result"
              :class="[
              'p-4 sm:p-6 rounded-lg transition-all duration-300 transform',
              result.win ? 'bg-green-100' : 'bg-red-100'
            ]"
          >
            <h2 class="text-xl sm:text-2xl font-bold text-center mb-2" :class="result.win ? 'text-green-700' : 'text-red-700'">
              {{ result.win ? '恭喜！你赢了！' : '很遗憾，你输了！' }}
            </h2>
            <p class="text-center text-gray-700">{{ result.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏规则 -->
    <div class="max-w-3xl mx-auto mt-4 sm:mt-8 bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-bold mb-2 sm:mb-4">游戏规则</h2>
      <ul class="list-disc list-inside space-y-1 sm:space-y-2 text-gray-600 text-sm sm:text-base">
        <li>选择一个骰子数（1-6）</li>
        <li>如果骰子结果与选择的面数相同，赢得5.5倍下注金额</li>
        <li>最小下注金额为1筹码</li>
        <li>最大下注金额为当前余额</li>
      </ul>
    </div>

    <!-- 使用历史记录面板组件 -->
    <HistoryPanel
        v-model="showHistory"
        :history="history"
        :pagination="pagination"
        @page-change="handlePageChange"
    />

    <!-- 使用结果提示框组件 -->
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

const diceRef = ref(null)
const betAmount = ref(10)
const result = ref(null)
const selectedFace = ref(1)
const isRolling = ref(false)
const showHistory = ref(false)
const showResult = ref(false)

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1
});

// 在组件挂载时获取用户信息和历史记录
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
      selectedFace.value > 0 &&
      !isRolling.value;
})

const placeBet = async () => {
  if (!canBet.value) return;

  isRolling.value = true;
  result.value = null;

  try {
    const response = await api.post('/api/game/bet/single', {
      amount: Number(betAmount.value),
      selectedFace: selectedFace.value
    });

    const { finalNumber, win, winAmount } = response;

    // 播放骰子动画
    await diceRef.value?.rollDice(finalNumber);

    // 更新用户信息
    await authStore.fetchUser();

    // 设置结果
    result.value = {
      win,
      diceResult: finalNumber,
      amount: betAmount.value,
      winAmount,
      message: win
          ? `骰子点数 ${finalNumber}！你赢得了 ${winAmount} 筹码！`
          : `骰子点数 ${finalNumber}！你输掉了 ${betAmount.value} 筹码！`
    };

    // 添加到历史记录并获取更新后的分页数据
    const paginationData = await gameStore.addToHistory({
      amount: betAmount.value,
      win,
      finalBalance: authStore.user?.balance,
      diceResults: [finalNumber],
      selectedOption: selectedFace.value,
      gameType: 'single'
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
/* 添加过渡动画样式 */
.transform {
  will-change: transform;
}

/* 自定义滚动条样式 */
.overflow-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

/* 添加遮罩层过渡效果 */
.bg-opacity-20 {
  transition: opacity 0.3s ease-in-out;
}
</style>