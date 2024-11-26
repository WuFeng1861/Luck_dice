<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold text-center text-gray-900 mb-12">选择游戏</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- 单骰子游戏 -->
        <router-link 
          to="/casino" 
          class="block group"
        >
          <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform group-hover:scale-105">
            <div class="bg-blue-600 p-4">
              <h2 class="text-2xl font-bold text-white text-center">幸运骰子</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-600 text-center mb-4">选择一个点数，猜中获得5.5倍奖励！</p>
              <div class="text-center">
                <span class="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                  赔率 1:5.5
                </span>
              </div>
            </div>
          </div>
        </router-link>

        <!-- 三骰子游戏 -->
        <router-link 
          to="/triple-dice" 
          class="block group"
        >
          <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform group-hover:scale-105">
            <div class="bg-purple-600 p-4">
              <h2 class="text-2xl font-bold text-white text-center">三倍幸运骰子</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-600 text-center mb-4">多种玩法，最高30倍奖励！</p>
              <div class="text-center">
                <span class="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full">
                  最高赔率 1:30
                </span>
              </div>
            </div>
          </div>
        </router-link>

        <!-- 龙虎斗游戏 -->
        <router-link 
          to="/games/dragon-tiger" 
          class="block group"
        >
          <div class="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform group-hover:scale-105">
            <div class="bg-gradient-to-r from-red-600 to-yellow-600 p-4">
              <h2 class="text-2xl font-bold text-white text-center">龙虎斗</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-600 text-center mb-4">经典对战，猜大小赢筹码！</p>
              <div class="text-center">
                <span class="inline-block px-4 py-2 bg-gradient-to-r from-red-100 to-yellow-100 text-red-800 rounded-full">
                  赔率 1:1 / 1:8
                </span>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 用户信息 -->
      <div class="mt-12 text-center">
        <p class="text-xl text-gray-700">
          当前余额: <span class="font-bold text-2xl">{{ authStore.user?.balance }}</span> 筹码
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.fetchUser()
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请重新登录')
    router.push('/login')
  }
})
</script> 