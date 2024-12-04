<template>
  <Transition name="fade">
    <div 
      v-if="show"
      class="fixed inset-0 flex items-center justify-center z-50"
      @click="$emit('update:show', false)"
    >
      <!-- 半透明遮罩层 -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      <!-- 结果框 -->
      <div 
        class="relative w-[90%] max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 transform transition-all duration-300"
        :class="[
          result?.cancelled ? 'border-l-4 border-yellow-500' :
          result?.win ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500',
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        ]"
        @click.stop
      >
        <!-- 关闭按钮 -->
        <button 
          @click="$emit('update:show', false)"
          class="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 角色动画容器 -->
        <div class="relative flex justify-center mb-6 character-wrapper">
          <!-- 彩色光效背景 -->
          <div 
            v-if="result?.win"
            class="absolute inset-0"
          >
            <div class="rainbow-glow-1"></div>
            <div class="rainbow-glow-2"></div>
            <div class="rainbow-glow-3"></div>
          </div>
          
          <!-- 角色图片容器 -->
          <div 
            class="relative character-container transform transition-all duration-1000"
            :class="[
              result?.cancelled ? 'scale-100 brightness-90' :
              result?.win ? 'scale-110 brightness-110' : 'scale-90 grayscale brightness-75'
            ]"
          >
            <img 
              src="https://wufeng98.cn/imgweb/uploads/1732869328543-1732869257476-5706e6b54c88b4930cbd0ef58406a28-removebg-preview.png" 
              alt="Character"
              class="w-48 h-48 object-contain transition-transform duration-1000"
            >
          </div>
        </div>

        <!-- 结果文本 -->
        <div class="text-center space-y-3 mb-6">
          <h3 
            class="text-2xl font-bold"
            :class="{
              'text-yellow-600': result?.cancelled,
              'text-green-600': result?.win && !result?.cancelled,
              'text-red-600': !result?.win && !result?.cancelled
            }"
          >
            {{ result?.cancelled ? '游戏取消' : (result?.win ? '胜利！' : '失败！') }}
          </h3>
          <p class="text-gray-600">{{ result?.message || (result?.win ? `赢得 ${result?.winAmount} 筹码！` : `输掉 ${result?.amount} 筹码！`) }}</p>
        </div>

        <!-- 确认按钮 -->
        <button 
          @click="$emit('update:show', false)"
          class="w-full py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105"
          :class="{
            'bg-yellow-500 hover:bg-yellow-600': result?.cancelled,
            'bg-green-500 hover:bg-green-600': result?.win && !result?.cancelled,
            'bg-red-500 hover:bg-red-600': !result?.win && !result?.cancelled
          }"
        >
          继续游戏
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  result: Object
})

defineEmits(['update:show'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.character-wrapper {
  perspective: 1000px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.character-container {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.rainbow-glow-1,
.rainbow-glow-2,
.rainbow-glow-3 {
  position: absolute;
  inset: -50%;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.5;
  mix-blend-mode: screen;
}

.rainbow-glow-1 {
  background: radial-gradient(circle at center,
    rgba(255, 0, 0, 0.8) 0%,
    rgba(255, 165, 0, 0.6) 30%,
    rgba(255, 255, 0, 0) 70%
  );
  animation: rotate 8s linear infinite;
}

.rainbow-glow-2 {
  background: radial-gradient(circle at center,
    rgba(0, 255, 0, 0.8) 0%,
    rgba(0, 255, 255, 0.6) 30%,
    rgba(0, 0, 255, 0) 70%
  );
  animation: rotate 12s linear infinite reverse;
}

.rainbow-glow-3 {
  background: radial-gradient(circle at center,
    rgba(238, 130, 238, 0.8) 0%,
    rgba(255, 0, 255, 0.6) 30%,
    rgba(148, 0, 211, 0) 70%
  );
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  to {
    transform: rotate(360deg) scale(1);
  }
}
</style>