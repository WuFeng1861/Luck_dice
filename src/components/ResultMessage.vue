<template>
  <Transition name="fade">
    <div 
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <!-- 遮罩层 -->
      <div 
        class="absolute inset-0 bg-black bg-opacity-30"
        @click="$emit('update:show', false)"
      ></div>
      
      <!-- 提示框 -->
      <div 
        class="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all text-center"
        :class="[
          result?.win ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
        ]"
      >
        <!-- 关闭按钮 -->
        <button 
          @click="$emit('update:show', false)"
          class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 结果图标 - 居中显示 -->
        <div class="flex justify-center mb-4">
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center"
            :class="result?.win ? 'bg-green-100' : 'bg-red-100'"
          >
            <svg 
              v-if="result?.win"
              class="w-10 h-10 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg 
              v-else
              class="w-10 h-10 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <!-- 标题 -->
        <h3 
          class="text-xl font-bold mb-2"
          :class="result?.win ? 'text-green-600' : 'text-red-600'"
        >
          {{ result?.win ? '恭喜！你赢了！' : '很遗憾，你输了！' }}
        </h3>

        <!-- 游戏结果详情 -->
        <div class="space-y-2 text-gray-600">
          <!-- 骰子结果 -->
          <p>
            <template v-if="Array.isArray(result?.diceResults)">
              <!-- 三骰子游戏 -->
              骰子点数：{{ result?.diceResults.join(' + ') }} = {{ result?.sum }}
            </template>
            <template v-else>
              <!-- 单骰子游戏 -->
              骰子点数：{{ result?.diceResult }}
            </template>
          </p>

          <!-- 下注和输赢金额 -->
          <p>
            下注金额：{{ result?.amount }} 筹码
          </p>
          <p v-if="result?.win" class="text-green-600 font-bold">
            赢得筹码：+{{ result?.winAmount }}
          </p>
          <p v-else class="text-red-600 font-bold">
            输掉筹码：-{{ result?.amount }}
          </p>
        </div>

        <!-- 确认按钮 -->
        <button 
          @click="$emit('update:show', false)"
          class="mt-6 w-full py-2 px-4 rounded-lg text-white font-medium transition-colors"
          :class="result?.win ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
        >
          确定
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  result: {
    type: Object,
    default: null
  }
});

defineEmits(['update:show']);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.transform {
  transition: transform 0.3s ease-out;
}

.fade-enter-from .transform,
.fade-leave-to .transform {
  transform: scale(0.95);
}
</style> 