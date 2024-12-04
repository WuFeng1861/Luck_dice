<template>
  <div class="min-h-screen bg-gray-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
    <!-- 主游戏区域 -->
    <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden relative z-10">
      <!-- 头部区域 -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-8 text-white relative">
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

        <h1 class="text-2xl sm:text-3xl font-bold text-center mb-2 sm:mb-4">大逃杀</h1>
        <div class="text-center">
          <span class="text-lg sm:text-xl">余额:</span>
          <span class="text-2xl sm:text-4xl font-bold ml-2">{{ authStore.user?.balance }}</span>
          <span class="ml-2">筹码</span>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div class="p-4 sm:p-8">
        <div class="space-y-6">
          <!-- 游戏状态和倒计时 -->
          <div class="text-center">
            <span class="text-lg font-medium">
              {{ gameStateText }}:
              {{ formatTime(remainingTime) }}
            </span>
          </div>

          <!-- 房间地图 -->
          <RoomMap
              :rooms="rooms"
              :selected-rooms="selectedRooms"
              :active-bets="activeBets"
              :game-state="gameState"
              :remaining-time="remainingTime"
              @select-room="handleRoomSelect"
          />

          <!-- 下注控制区 -->
          <BettingControls
              v-model="betAmount"
              :max-bet="authStore.user?.balance"
              :can-bet="canBet"
              @bet="placeBet"
          />

          <!-- 游戏规则 -->
          <GameRules />
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
    <RoomGameResult
        v-model:show="showResult"
        :result="result"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { GAME_STATES } from '@/constants/gameConstants'
import api from '@/api/axios'
import RoomMap from './room-game/RoomMap.vue'
import BettingControls from './room-game/BettingControls.vue'
import GameRules from './room-game/GameRules.vue'
import HistoryPanel from './HistoryPanel.vue'
import RoomGameResult from './room-game/RoomGameResult.vue'
import {getCurrentGame, placeBets} from "@/api/roomGame.js";
import {storeToRefs} from "pinia";
import {useGameStore} from "@/stores/game.js";

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const { history } = storeToRefs(gameStore)

// 本地状态
const selectedRooms = ref([])
const betAmount = ref(10)
const result = ref(null)
const showHistory = ref(false)
const showResult = ref(false)
const rooms = ref([])
const activeBets = ref([])
const gameState = ref(GAME_STATES.WAITING)
const remainingTime = ref(0)
const currentGameId = ref(null)
const endTime = ref(null)
let animationFrameId = null
let inView = ref(true);

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1
})

// 计算属性
const canBet = computed(() => {
  return betAmount.value > 0 &&
      betAmount.value * selectedRooms.value.length <= authStore.user?.balance &&
      [GAME_STATES.RUNNING, GAME_STATES.WAITING].includes(gameState.value)
})

const gameStateText = computed(() => {
  switch (gameState.value) {
    case GAME_STATES.WAITING:
      return '等待开始'
    case GAME_STATES.RUNNING:
      return '选择躲避房间'
    case GAME_STATES.SETTLING:
      return '结算中'
    default:
      return '游戏结束'
  }
})

// 方法
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

let lastTime = 0;
const updateZoneBetsInterval = 1000;
let isUpdateZoneBetsFinish = true;
const updateZoneBets = async () => {
  const now = Date.now()
  if(now - lastTime > updateZoneBetsInterval && isUpdateZoneBetsFinish && currentGameId.value) {
    isUpdateZoneBetsFinish = false;
    let response = await api.get(`/api/battle-royale/zone-bets?gameId=${currentGameId.value}`);
    let zoneBetsTemp = response.zoneBets;
    for (let index = 0; index < 8; index++) {
      rooms.value[index].chips = zoneBetsTemp[index + 1];
    }
    lastTime = Date.now();
  }
  isUpdateZoneBetsFinish = true;
}

let gameSettleTimes = {};
let gameFetchResultTimes = {};
const updateTimer = () => {
  if (!endTime.value) return

  const now = Date.now()
  const remaining = Math.max(0, Math.floor((endTime.value - now) / 1000))
  if (remaining !== remainingTime.value) {
    remainingTime.value = remaining
    updateZoneBets();
  }

  if (remaining === 0) {
    console.log('游戏结束', currentGameId.value, JSON.stringify(gameFetchResultTimes), JSON.stringify(gameSettleTimes))
    if ([GAME_STATES.RUNNING, GAME_STATES.WAITING].includes(gameState.value) && !gameFetchResultTimes[currentGameId.value]) {
      gameState.value = GAME_STATES.SETTLING
      fetchGameResult(currentGameId.value)
      gameFetchResultTimes[currentGameId.value] = 1;
    } else if (gameState.value === GAME_STATES.SETTLING && !gameSettleTimes[currentGameId.value]) {
      startNewGame();
      gameSettleTimes[currentGameId.value] = 1;
    }
  }
  
  animationFrameId = requestAnimationFrame(updateTimer)
}

const handleRoomSelect = (roomIndex) => {

  if (![GAME_STATES.RUNNING, GAME_STATES.WAITING].includes(gameState.value)) return

  const index = selectedRooms.value.indexOf(roomIndex)
  if (index === -1) {
    selectedRooms.value.push(roomIndex)
  } else {
    selectedRooms.value.splice(index, 1)
  }
}

const placeBet = async () => {
  if (!canBet.value || selectedRooms.value.length === 0) return

  const totalBetAmount = betAmount.value * selectedRooms.value.length
  if (totalBetAmount > authStore.user?.balance) {
    ElMessage.warning('余额不足')
    return
  }

  try {
    const bets = selectedRooms.value.map(roomIndex => ({
      zone: roomIndex + 1,
      amount: betAmount.value
    }))

    await placeBets(bets)

    // 更新下注的本地状态
    selectedRooms.value.forEach(roomIndex => {
      const existingBet = activeBets.value.find(bet => bet.roomIndex === roomIndex)
      if (existingBet) {
        existingBet.amount = Number(existingBet.amount) + Number(betAmount.value)
      } else {
        activeBets.value.push({
          amount: betAmount.value,
          roomIndex
        })
      }
    })

    await authStore.fetchUser()
    selectedRooms.value = []
    ElMessage.success('下注成功')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '下注失败')
  }
}
let isFetchGameResultFinish = true;
const fetchGameResult = async (endGameId) => {
  if (!endGameId) return
  if (!isFetchGameResultFinish) return
  isFetchGameResultFinish = false;

  try {
    const response = await api.get(`/api/battle-royale/${endGameId}`)
    console.log('获取游戏结果', response.status, response.gameId, endGameId);
    if (response.status !== 'finished') {
      setTimeout(() => {
        if (inView.value) {
          fetchGameResult(endGameId)
        }
      }, 1000)
      return
    }

    if (!response.isValid) {
      result.value = {
        cancelled: true,
        message: '活跃房间数量不足3个，本轮游戏取消，押注已返还。',
        amount: response.userStats.totalBetAmount
      }
    } else {
      response.safeZones.forEach(zone => {
        rooms.value[zone - 1].isWinner = true
      })

      result.value = {
        win: response.userStats.totalWinAmount > 0,
        amount: response.userStats.totalBetAmount,
        winAmount: response.userStats.totalWinAmount,
        winningZones: response.safeZones
      }
    }
    if (response.userBets.length === 0) {
      return;
    }
    await authStore.fetchUser()
    console.log('获取游戏结果提示框:', result.value);
    showResult.value = true
    const paginationData = await gameStore.fetchHistory(1);
    pagination.value = paginationData;
  } catch (error) {
    ElMessage.error('获取游戏结果失败')
    setTimeout(() => {
      if (inView.value) {
        fetchGameResult(endGameId)
      }
    }, 1000)
  } finally {
    isFetchGameResultFinish = true;
  }
}

let isStartNewGameFinish = true;
const startNewGame = async () => {
  if (!isStartNewGameFinish ) return

  try {
    isStartNewGameFinish = false;
    const response = await getCurrentGame();
    console.log('获取游戏结果新游戏', response.status, response.gameId, 'isFetchGameResultFinish:', isFetchGameResultFinish);
    if (currentGameId.value === response.gameId || !isFetchGameResultFinish) {
      setTimeout(() => {
        if (inView.value) {
          startNewGame()
        }
      }, 1000)
      return
    }

    currentGameId.value = response.gameId
    gameState.value = response.status
    endTime.value = new Date(response.endTime).getTime()
    let ROOM_CONFIG = [
      {x:0,y:3,width:38,height:30,chips:0},
      {x:38,y:5,width:28,height:28,chips:0},
      {x:66,y:3,width:35,height:30,chips:0},
      {x:0,y:32,width:28,height:35,chips:0},
      {x:28,y:46,width:38,height:22,chips:0},
      {x:80,y:46,width:19,height:32,chips:0},
      {x:0,y:66,width:28,height:32,chips:0},
      {x:28,y:80,width:38,height:18,chips:0}
    ]
    rooms.value = Array(8).fill(null).map((_, index) => {
      return {
        ...ROOM_CONFIG[index],
        chips: Number(response.zoneBets[index + 1] || 0),
        isWinner: rooms.value[index]?.isWinner || false
      }
    })
    let nextInterval = new Date(response.endTime).getTime() - new Date().getTime();
    let interval = 20*1000;
    if (nextInterval < 40*1000) {
      interval = 0;
    }
    setTimeout(() => {
      rooms.value.forEach(room => {
        room.isWinner = false
      })
    }, interval);

    activeBets.value = response.userBets.map(bet => {
      return {
        amount: bet.amount,
        roomIndex: bet.zone - 1
      }
    })
    // result.value = null
    // showResult.value = false

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    animationFrameId = requestAnimationFrame(updateTimer)
  } catch (error) {
    console.error(error, '获取游戏信息失败');
    ElMessage.error('获取游戏信息失败')
    setTimeout(() => {
      if (inView.value) {
        startNewGame()
      }
    }, 1000)
  } finally {
    isStartNewGameFinish = true;
  }
}

// 初始化
onMounted(async () => {
  try {
    await authStore.fetchUser()
    await startNewGame()
    const paginationData = await gameStore.fetchHistory(1);
    pagination.value = paginationData;
  } catch (error) {
    ElMessage.error('初始化游戏失败')
    router.push('/games')
  }
})

// 清理
onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  inView.value = false;
})

const handlePageChange = (page) => {
  pagination.value.currentPage = page
}
</script>

<style scoped>
.from-indigo-600 {
  --tw-gradient-from: #4f46e5;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(79 70 229 / 0));
}

.to-purple-600 {
  --tw-gradient-to: #9333ea;
}

.hover\:from-indigo-700:hover {
  --tw-gradient-from: #4338ca;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(67 56 202 / 0));
}

.hover\:to-purple-700:hover {
  --tw-gradient-to: #7e22ce;
}
</style>