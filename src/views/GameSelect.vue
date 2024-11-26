<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- 顶部用户信息 -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-2">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">欢迎, {{ authStore.user?.username }}</h2>
              <p class="text-lg font-medium text-green-600">余额: {{ authStore.user?.balance }} 筹码</p>
            </div>
          </div>
          <div class="flex gap-4">
            <router-link 
              v-if="authStore.user?.id === 1"
              to="/stats"
              class="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              数据统计
            </router-link>
            <button 
              @click="handleLogout"
              class="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      <!-- 游戏列表标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">选择游戏</h1>
        <p class="mt-2 text-gray-600">选择您想要体验的游戏</p>
      </div>

      <!-- 游戏列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- 幸运骰子游戏 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200">
          <div class="h-48 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <div class="relative w-24 h-24">
              <div class="absolute inset-0 bg-white rounded-lg transform rotate-45"></div>
              <div class="absolute inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg transform -rotate-45 flex items-center justify-center">
                <div class="grid grid-cols-3 gap-1">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">幸运骰子</h3>
            <p class="text-gray-600 mb-4">
              选择一个骰子面数并下注，猜中获得5倍奖励！快来试试你的运气吧！
            </p>
            <router-link 
              to="/casino"
              class="block w-full text-center py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              开始游戏
            </router-link>
          </div>
        </div>

        <!-- 三倍幸运骰子游戏 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200">
          <div class="h-48 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <div class="flex gap-4">
              <div class="relative w-16 h-16" v-for="i in 3" :key="i">
                <div class="absolute inset-0 bg-white rounded-lg transform rotate-45"></div>
                <div class="absolute inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg transform -rotate-45"></div>
              </div>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">三倍幸运骰子</h3>
            <p class="text-gray-600 mb-4">
              三枚骰子，猜大小中！中奖最高可获得30倍奖励！
            </p>
            <router-link 
              to="/triple-dice"
              class="block w-full text-center py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              开始游戏
            </router-link>
          </div>
        </div>

        <!-- 龙虎斗游戏 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-200">
          <div class="h-48 bg-gradient-to-r from-red-600 to-yellow-600 flex items-center justify-center">
            <div class="flex gap-8">
              <div class="text-white text-6xl font-bold">龙</div>
              <div class="text-white text-4xl font-bold">VS</div>
              <div class="text-white text-6xl font-bold">虎</div>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">龙虎斗</h3>
            <p class="text-gray-600 mb-4">
              经典对战，猜大小赢筹码！龙虎对决，最高8倍奖励！
            </p>
            <router-link 
              to="/games/dragon-tiger"
              class="block w-full text-center py-3 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-lg hover:from-red-700 hover:to-yellow-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              开始游戏
            </router-link>
          </div>
        </div>

        <!-- 更多游戏卡片（待开发） -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden opacity-75">
          <div class="h-48 bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
            <svg class="w-24 h-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">敬请期待</h3>
            <p class="text-gray-600 mb-4">
              更多精彩游戏正在开发中，敬请期待！
            </p>
            <button 
              disabled
              class="w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed"
            >
              即将推出
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error('退出失败')
  }
}
</script>

<style scoped>
.from-purple-600 {
  --tw-gradient-from: #9333ea;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(147 51 234 / 0));
}

.to-blue-600 {
  --tw-gradient-to: #2563eb;
}

.hover\:from-purple-700:hover {
  --tw-gradient-from: #7e22ce;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgb(126 34 206 / 0));
}

.hover\:to-blue-700:hover {
  --tw-gradient-to: #1d4ed8;
}
</style> 