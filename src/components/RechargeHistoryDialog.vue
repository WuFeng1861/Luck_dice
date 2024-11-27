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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        </div>

        <!-- 标题 -->
        <h3 class="text-xl font-bold mb-4 text-gray-900">充值记录</h3>

        <!-- 记录列表 -->
        <div class="max-h-96 overflow-y-auto mb-4">
          <div v-if="loading" class="py-8 text-gray-500">
            加载中...
          </div>
          <div v-else-if="records.length === 0" class="text-gray-500 py-8">
            暂无充值记录
          </div>
          <div v-else class="space-y-3">
            <div
                v-for="record in records"
                :key="record.hash"
                class="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-4"
            >
              <!-- 左侧：充值金额 -->
              <div class="text-lg font-bold text-blue-600 shrink-0">
                +{{ record.amount }} 筹码
              </div>

              <!-- 右侧：时间和哈希 -->
              <div class="flex flex-col items-end gap-1 min-w-0">
                <div class="text-sm text-gray-500">
                  {{ formatTime(record.createTime) }}
                </div>
                <div
                    class="text-sm font-medium text-gray-900 cursor-pointer group relative truncate max-w-full"
                    @click="copyHash(record.hash)"
                >
                  <!-- 截断的哈希值 -->
                  {{ truncateHash(record.hash) }}

                  <!-- Tooltip -->
                  <div class="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 -top-8 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {{ record.hash }}
                  </div>

                  <!-- 复制成功提示 -->
                  <div
                      v-if="copiedHash === record.hash"
                      class="absolute right-0 -top-8 bg-green-600 text-white text-xs rounded px-2 py-1 whitespace-nowrap"
                  >
                    已复制
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页控制 -->
        <div v-if="pagination.totalPages > 0" class="border-t pt-4 mb-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">
              共 {{ pagination.totalItems }} 条记录
            </span>
            <div class="flex items-center gap-2">
              <button
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span class="text-sm">{{ currentPage }} / {{ pagination.totalPages }}</span>
              <button
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === pagination.totalPages"
                  class="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
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
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api/axios'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

defineEmits(['update:modelValue'])

const records = ref([])
const loading = ref(false)
const copiedHash = ref('')
const currentPage = ref(1)
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1
})

// 监听对话框打开状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    currentPage.value = 1
    fetchRecords()
  }
})

// 获取充值记录
const fetchRecords = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/recharge/history', {
      params: { page: currentPage.value }
    })
    records.value = response.history
    pagination.value = response.pagination
  } catch (error) {
    ElMessage.error('获取充值记录失败')
    console.error('获取充值记录失败:', error)
  } finally {
    loading.value = false
  }
}

const changePage = async (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  currentPage.value = page
  await fetchRecords()
}

const truncateHash = (hash) => {
  return hash.slice(0, 6) + '...' + hash.slice(-4)
}

const copyHash = async (hash) => {
  try {
    await navigator.clipboard.writeText(hash)
    copiedHash.value = hash
    ElMessage.success('Hash已复制')
    setTimeout(() => {
      copiedHash.value = ''
    }, 2000)
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

onMounted(() => {
  if (props.modelValue) {
    fetchRecords()
  }
})
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

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>