<template>
  <Transition name="fade">
    <div
        v-if="modelValue"
        class="fixed inset-0 flex items-center justify-center z-50"
    >
      <!-- 遮罩层 -->
      <div
          class="absolute inset-0 bg-black bg-opacity-30"
          @click="$emit('update:modelValue', false)"
      ></div>

      <!-- 提示框 -->
      <div
          class="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all text-center border-l-4 border-blue-500"
      >
        <!-- 关闭按钮 -->
        <button
            @click="$emit('update:modelValue', false)"
            class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 图标 -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- 标题 -->
        <h3 class="text-xl font-bold mb-4 text-gray-900">充值</h3>

        <!-- 提示内容 -->
        <p class="text-gray-600 mb-6">
          使用您绑定的地址在MERC网络中转帐到充值地址中，比例为1:1
        </p>

        <!-- 充值地址 -->
        <div class="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-2 mb-6">
          <div class="text-sm text-gray-600 break-all">
            {{address}}
          </div>
          <button
              @click="copyAddress"
              class="shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              :class="copied ? 'text-green-600' : 'text-gray-600'"
          >
            <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        <!-- 确认按钮 -->
        <button
            @click="$emit('update:modelValue', false)"
            class="w-full py-2 px-4 rounded-lg text-white font-medium transition-colors bg-blue-500 hover:bg-blue-600"
        >
          确定
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

defineEmits(['update:modelValue'])

const copied = ref(false)
const address = ref('0xbeb46a90895ea3302ae7c77f67a4f71c16bddec0')

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(address.value)
    copied.value = true
    ElMessage.success('地址已复制')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
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