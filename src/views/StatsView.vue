<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- 顶部导航 -->
      <div class="flex justify-between items-center mb-8">
        <router-link 
          to="/games"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回游戏
        </router-link>
        <h1 class="text-2xl font-bold">游戏数据统计</h1>
      </div>

      <!-- 时间范围选择 -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div class="flex gap-4 mb-4">
          <button
            v-for="period in ['daily', 'weekly', 'monthly']"
            :key="period"
            @click="selectedPeriod = period; fetchStats(period)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            ]"
          >
            {{ periodLabels[period] }}
          </button>
        </div>

        <!-- 自定义日期范围 -->
        <div class="flex gap-4 items-center">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
          <button
            @click="fetchCustomStats"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            查询
          </button>
        </div>
      </div>

      <!-- 统计数据展示 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 单骰子游戏统计 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4">幸运骰子统计</h2>
          <div v-if="singleGameStats" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总游戏次数</div>
                <div class="text-2xl font-bold">{{ singleGameStats.totalGames }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总下注金额</div>
                <div class="text-2xl font-bold">{{ singleGameStats.totalBets }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总支出金额</div>
                <div class="text-2xl font-bold">{{ singleGameStats.totalPayouts }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">净利润</div>
                <div 
                  class="text-2xl font-bold"
                  :class="singleGameStats.profit >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ singleGameStats.profit }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">胜率</div>
                <div class="text-2xl font-bold">{{ singleGameStats.winRate }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">庄家优势</div>
                <div class="text-2xl font-bold">{{ singleGameStats.houseEdge }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-8">
            暂无数据
          </div>
        </div>

        <!-- 三骰子游戏统计 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4">三倍幸运骰子统计</h2>
          <div v-if="tripleGameStats" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总游戏次数</div>
                <div class="text-2xl font-bold">{{ tripleGameStats.totalGames }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总下注金额</div>
                <div class="text-2xl font-bold">{{ tripleGameStats.totalBets }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总支出金额</div>
                <div class="text-2xl font-bold">{{ tripleGameStats.totalPayouts }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">净利润</div>
                <div 
                  class="text-2xl font-bold"
                  :class="tripleGameStats.profit >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ tripleGameStats.profit }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">胜率</div>
                <div class="text-2xl font-bold">{{ tripleGameStats.winRate }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">庄家优势</div>
                <div class="text-2xl font-bold">{{ tripleGameStats.houseEdge }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-8">
            暂无数据
          </div>
        </div>

        <!-- 龙虎斗统计 -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4">龙虎斗统计</h2>
          <div v-if="dragonTigerStats" class="space-y-4">
            <!-- 基础数据 -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总游戏次数</div>
                <div class="text-2xl font-bold">{{ dragonTigerStats.totalGames }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总下注金额</div>
                <div class="text-2xl font-bold">{{ dragonTigerStats.totalBets }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">总支出金额</div>
                <div class="text-2xl font-bold">{{ dragonTigerStats.totalPayouts }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-600">净利润</div>
                <div 
                  class="text-2xl font-bold"
                  :class="dragonTigerStats.profit >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  {{ dragonTigerStats.profit }}
                </div>
              </div>
            </div>

            <!-- 详细统计 -->
            <div class="grid grid-cols-3 gap-4">
              <!-- 龙统计 -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-bold mb-2 text-red-600">龙</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">总次数:</span>
                    <span>{{ dragonTigerStats.typeStats.dragon }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">胜利次数:</span>
                    <span>{{ dragonTigerStats.typeStats.dragonWins }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">胜率:</span>
                    <span>{{ ((dragonTigerStats.typeStats.dragonWins / dragonTigerStats.typeStats.dragon) * 100).toFixed(2) }}%</span>
                  </div>
                </div>
              </div>

              <!-- 虎统计 -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-bold mb-2 text-yellow-600">虎</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">总次数:</span>
                    <span>{{ dragonTigerStats.typeStats.tiger }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">胜利次数:</span>
                    <span>{{ dragonTigerStats.typeStats.tigerWins }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">胜率:</span>
                    <span>{{ ((dragonTigerStats.typeStats.tigerWins / dragonTigerStats.typeStats.tiger) * 100).toFixed(2) }}%</span>
                  </div>
                </div>
              </div>

              <!-- 和统计 -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-bold mb-2 text-purple-600">和</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">总次数:</span>
                    <span>{{ dragonTigerStats.typeStats.tie }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">胜利次数:</span>
                    <span>{{ dragonTigerStats.typeStats.tieWins }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">胜率:</span>
                    <span>{{ ((dragonTigerStats.typeStats.tieWins / dragonTigerStats.typeStats.tie) * 100).toFixed(2) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-center py-8">
            暂无数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import api from '@/api/axios.js'

const router = useRouter()
const authStore = useAuthStore()

// 添加 stats 状态
const stats = ref([]);
const selectedPeriod = ref('daily')
const dateRange = ref([])

// 检查权限
onMounted(async () => {
  if (authStore.user?.id !== 1) {
    ElMessage.error('没有权限访问此页面')
    router.push('/games')
    return
  }
  await fetchStats('daily')
})

const periodLabels = {
  daily: '今日',
  weekly: '本周',
  monthly: '本月'
}

// 获取统计数据
const fetchStats = async (period) => {
  try {
    const response = await api.get(`/api/stats/${period}`)
    stats.value = response.stats;
    selectedPeriod.value = period;
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取自定义时间范围的统计数据
const fetchCustomStats = async () => {
  if (!dateRange.value?.[0] || !dateRange.value?.[1]) {
    ElMessage.warning('请选择日期范围')
    return
  }

  try {
    const response = await api.get('/api/stats/custom', {
      params: {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1]
      }
    })
    stats.value = response.stats;
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取各游戏统计数据
const singleGameStats = computed(() => {
  return stats.value?.find(s => s.gameType === 'single');
});

const tripleGameStats = computed(() => {
  return stats.value?.find(s => s.gameType === 'triple');
});

const dragonTigerStats = computed(() => {
  return stats.value?.find(s => s.gameType === 'dragon-tiger');
});
</script> 