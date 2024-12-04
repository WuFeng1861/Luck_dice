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
            v-if="canClose"
            @click="$emit('update:modelValue', false)"
            class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 地址显示按钮 -->
        <button
            @click="connectWalletBeforeAuth"
            class="absolute right-4 top-4 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm flex items-center gap-2 group"
        >
          <span class="truncate max-w-[120px]">{{ connectedWalletAddress === '' ? '连接钱包' : connectedWalletAddress.slice(0, 5)+'...'+connectedWalletAddress.slice(-3) }}</span>
          <svg 
            class="w-4 h-4 transition-transform group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>

        <!-- 标题图标 -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- 标题 -->
        <h3 class="text-xl font-bold mb-4 text-gray-900">绑定地址</h3>

        <!-- 表单内容 -->
        <div class="space-y-4">
          <!-- 地址输入 -->
          <div>
            <input
                v-model="address"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请输入您的地址"
            />
          </div>

          <!-- 验证码 -->
          <div class="flex flex-col sm:flex-row gap-2">
            <input
                v-model="captchaText"
                type="text"
                maxlength="4"
                class="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请输入验证码"
            />
            <div
                class="w-full sm:w-2/3 h-[42px] bg-gray-100 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center"
                @click="refreshCaptcha"
            >
              <div class="captcha-container w-full h-full flex items-center justify-center" v-html="captchaSvg"></div>
            </div>
          </div>
        </div>

        <!-- 确认按钮 -->
        <button
            @click="handleSubmit"
            :disabled="loading"
            class="mt-6 w-full py-2 px-4 rounded-lg text-white font-medium transition-colors bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">确认绑定</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            处理中...
          </span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/axios.js'
import { useAuthStore } from '@/stores/auth'
import {
  checkConnectWallet,
  connectWalletBeforeAuth,
  getBindAddressSignRes,
  getConnectedWalletAddressRef
} from "@/composition/EthWallet/useEthWallet.js";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  canClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const authStore = useAuthStore()
const address = ref('')
const captchaText = ref('')
const captchaSvg = ref('')
const captchaId = ref('')
const loading = ref(false)
const connectedWalletAddress = getConnectedWalletAddressRef();

// 获取验证码
const getCaptcha = async () => {
  try {
    const response = await api.get('/api/auth/captcha')
    captchaSvg.value = response.svg
    captchaId.value = response.captchaId
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  getCaptcha()
  captchaText.value = ''
}

// 复制地址
const copyAddress = async () => {
  if (!connectedWalletAddress.value) {
    ElMessage.warning('请先连接钱包')
    return;
  }
  try {
    await navigator.clipboard.writeText(connectedWalletAddress.value)
    ElMessage.success('地址已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 提交绑定
const handleSubmit = async () => {
  if (!address.value) {
    ElMessage.warning('请输入地址')
    return
  }
  if (!captchaText.value) {
    ElMessage.warning('请输入验证码')
    return
  }

  loading.value = true
  try {
    let isConnectAddress = await checkConnectWallet(address.value);
    if(!isConnectAddress) {
      ElMessage.warning('请连接正确的钱包');
      return;
    }
    let signResult = await getBindAddressSignRes();
    if(!signResult.status) {
      ElMessage.warning(signResult.message);
      return;
    }

    await api.post('/api/auth/bind-address', {
      address: address.value,
      captchaId: captchaId.value,
      captchaText: captchaText.value,
      signRes: signResult.data
    })
    ElMessage.success('地址绑定成功')
    emit('success', address.value)
    emit('update:modelValue', false)
    captchaText.value = ''
  } catch (error) {
    ElMessage.error(error.response?.data?.error?.message || '绑定失败')
    refreshCaptcha()
  } finally {
    loading.value = false
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

.captcha-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.captcha-container :deep(svg) {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>