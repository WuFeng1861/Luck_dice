<template>
  <div>
    <!-- 遮罩层 -->
    <div
        v-if="modelValue"
        class="fixed inset-0 bg-black bg-opacity-20 transition-opacity"
        @click="$emit('update:modelValue', false)"
    ></div>

    <!-- 历史记录面板 -->
    <div
        class="fixed right-0 top-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 w-full sm:max-w-[66.666667vw] sm:w-96"
        :class="modelValue ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="p-4 h-full flex flex-col relative">
        <!-- 关闭按钮 -->
        <button
            @click="$emit('update:modelValue', false)"
            class="absolute right-2 sm:right-4 top-2 sm:top-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
              class="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h2 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2 pr-10">历史记录</h2>

        <!-- 历史记录列表容器 -->
        <div class="flex-1 overflow-auto">
          <!-- 无记录时显示 -->
          <div
              v-if="!history?.length"
              class="h-full flex items-center justify-center text-gray-400"
          >
            暂无游戏记录
          </div>

          <!-- 历史记录列表 -->
          <div v-else class="space-y-3">
            <div
                v-for="(record, index) in history"
                :key="index"
                class="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <!-- 游戏类型和时间 -->
              <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                <span class="text-sm font-medium text-gray-600">
                  {{
                    record.gameType === 'single' ? '幸运骰子' :
                        record.gameType === 'triple' ? '三倍幸运骰子' :
                            record.gameType === 'dragon-tiger' ? '龙虎斗' :
                                record.gameType === 'battle-royale' ? '大逃杀' :
                                record.gameType
                  }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ new Date(record.createdAt).toLocaleString() }}
                </span>
              </div>

              <!-- 游戏详情 -->
              <div class="space-y-2">
                <!-- 选择和结果 -->
                <div class="flex justify-between flex-wrap gap-2">
                  <div class="text-sm">
                    <span class="text-gray-600">选择: </span>
                    <span class="font-medium">
                      {{ formatSelection(record.selectedOption, record.gameType) }}
                    </span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-600">结果: </span>
                    <span class="font-medium">
                      {{ formatResult(record.diceResults, record.gameType) }}
                    </span>
                  </div>
                </div>

                <!-- 下注金额和输赢 -->
                <div class="flex justify-between items-center flex-wrap gap-2">
                  <div class="text-sm">
                    <span class="text-gray-600">下注: </span>
                    <span class="font-medium">{{ record.amount }}</span>
                  </div>
                  <div
                      class="px-2 py-1 rounded text-sm font-medium"
                      :class="record.win ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ record.win ? '胜利' : '失败' }}
                  </div>
                </div>

                <!-- 余额 -->
                <div class="text-sm text-right text-gray-600">
                  余额: {{ record.finalBalance }}
                </div>
              </div>
            </div>
          </div>

          <!-- 分页控制 -->
          <div v-if="pagination.totalPages > 0" class="mt-4 p-4 bg-white border-t">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <!-- 页码信息 -->
              <div class="text-sm text-gray-700">
                共 {{ pagination.totalItems }} 条记录，
                每页 {{ pagination.pageSize }} 条
              </div>

              <!-- 跳转页码输入 -->
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">跳转到</span>
                <input
                    v-model="jumpPage"
                    type="number"
                    min="1"
                    :max="pagination.totalPages"
                    class="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    @keyup.enter="handleJumpPage"
                >
                <span class="text-sm text-gray-600">页</span>
              </div>
            </div>

            <!-- 分页按钮组 -->
            <div class="flex justify-center items-center space-x-1 sm:space-x-2 mt-3 flex-wrap gap-y-2">
              <!-- 首页 -->
              <button
                  @click="changePage(1)"
                  :disabled="pagination.currentPage === 1"
                  class="px-2 py-1 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                首页
              </button>

              <!-- 上一页 -->
              <button
                  @click="changePage(pagination.currentPage - 1)"
                  :disabled="pagination.currentPage === 1"
                  class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>

              <!-- 页码按钮组 -->
              <div class="flex space-x-1 flex-wrap gap-y-1">
                <template v-for="page in displayPages" :key="page">
                  <button
                      v-if="page !== '...'"
                      @click="changePage(page)"
                      :class="[
                      'w-8 h-8 rounded-full text-sm',
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <span
                      v-else
                      class="w-8 h-8 flex items-center justify-center text-gray-500"
                  >
                    ...
                  </span>
                </template>
              </div>

              <!-- 下一页 -->
              <button
                  @click="changePage(pagination.currentPage + 1)"
                  :disabled="pagination.currentPage === pagination.totalPages"
                  class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>

              <!-- 末页 -->
              <button
                  @click="changePage(pagination.totalPages)"
                  :disabled="pagination.currentPage === pagination.totalPages"
                  class="px-2 py-1 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                末页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  history: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    })
  }
});

const emit = defineEmits(['update:modelValue', 'page-change']);

// 页码跳转输入
const jumpPage = ref('');

// 计算要显示的页码
const displayPages = computed(() => {
  const current = props.pagination.currentPage;
  const total = props.pagination.totalPages;
  const delta = 2; // 当前页码前后显示的页数

  let pages = [];

  // 计算显示的页码范围
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  // 添加首页
  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push('...');
  }

  // 添加中间页码
  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  // 添加末页
  if (right < total) {
    if (right < total - 1) pages.push('...');
    pages.push(total);
  }

  return pages;
});

// 页码切换
const changePage = (page) => {
  if (page >= 1 && page <= props.pagination.totalPages) {
    emit('page-change', page);
  }
};

// 处理页码跳转
const handleJumpPage = () => {
  const page = parseInt(jumpPage.value);
  if (page && page >= 1 && page <= props.pagination.totalPages) {
    changePage(page);
    jumpPage.value = '';
  }
};

// 格式化选择
const formatSelection = (selection, gameType) => {
  if (gameType === 'single') {
    return `点数 ${selection}`;
  }

  if (gameType === 'dragon-tiger') {
    const optionLabels = {
      'dragon': '龙',
      'tiger': '虎',
      'tie': '和'
    };
    return optionLabels[selection] || selection;
  }

  if(gameType === 'triple') {
    const optionLabels = {
      'big': '大',
      'small': '小',
      'middle': '中',
      'triple': '豹子',
      'pair': '对子',
      'straight': '顺子'
    };
  
    return optionLabels[selection] || selection;
  }
  if (gameType === 'battle-royale') {
    return JSON.parse(selection).join('、')
  }
  
};

// 格式化结果
const formatResult = (results, gameType) => {
  if (!Array.isArray(results)) {
    results = [results];
  }

  if (gameType === 'single') {
    return `点数 ${results[0]}`;
  }

  if (gameType === 'dragon-tiger') {
    const cardNames = {
      1: 'A',
      11: 'J',
      12: 'Q',
      13: 'K'
    };
    const dragonCard = cardNames[results[0]] || results[0];
    const tigerCard = cardNames[results[1]] || results[1];
    return `龙: ${dragonCard} vs 虎: ${tigerCard}`;
  }

  // 三骰子游戏
  if(gameType === 'triple') {
    const sum = results.reduce((a, b) => a + b, 0);
    return `${results.join('+')}=${sum}`;
  }
  if(gameType === 'battle-royale') {
    return results.join('、');
  }
  
};
</script>

<style scoped>
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