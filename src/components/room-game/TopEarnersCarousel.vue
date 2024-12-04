<template>
  <div
      class="overflow-hidden bg-gradient-to-r from-indigo-600/10 to-purple-600/10 backdrop-blur-sm rounded-lg p-4"
      :class="[
      'transition-all duration-300',
      isDesktop ? 'fixed left-4 top-1/2 -translate-y-1/2 w-80 z-10' : 'relative w-full'
    ]"
  >
    <div class="flex items-center gap-2 mb-3">
      <div class="shrink-0 animate-spin-slow">
        <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>
      <span class="text-indigo-600 font-medium">排行榜</span>
    </div>

    <div class="relative h-[4.5rem] overflow-hidden">
      <div
          class="absolute inset-0 transition-transform duration-500 ease-out"
          :style="{
          transform: `translateY(${-currentIndex * 4.5}rem)`,
        }"
      >
        <div
            v-for="(group, groupIndex) in groupedUsers"
            :key="groupIndex"
            class="h-[4.5rem]"
        >
          <div
              v-for="(user, index) in group"
              :key="user.id"
              class="h-[1.5rem] flex items-center gap-2 text-sm group"
          >
            <span
                class="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full font-medium transition-all duration-300 group-hover:bg-indigo-200 group-hover:scale-110"
            >
              {{ groupIndex * VISIBLE_COUNT + index + 1 }}
            </span>
            <span
                class="font-medium text-indigo-600 truncate max-w-[80px] transition-all duration-300 group-hover:text-indigo-700 group-hover:scale-105"
            >
              {{ user.username.length > 3 ? user.username.slice(0, 3) + '***' : user.username }}
            </span>
            <span class="text-gray-600 shrink-0">第</span>
            <span
                class="font-medium text-purple-600 shrink-0 transition-all duration-300 group-hover:text-purple-700 group-hover:scale-105"
            >
              {{ user.roundId }}
            </span>
            <span class="text-gray-600 shrink-0">轮,拔得头筹 </span>
            <span
                class="font-bold text-green-600 shrink-0 transition-all duration-300 group-hover:text-green-700 group-hover:scale-105"
            >
              {{ formatEarnings(user.profit) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import api from '@/api/axios';

const topEarners = ref([]);
const currentIndex = ref(0);
const timer = ref(null);
const isDesktop = ref(false);

const VISIBLE_COUNT = 3;
const SLIDE_INTERVAL = 3000;

const formatEarnings = (earnings) => {
  const num = parseFloat(earnings);
  if (isNaN(num)) return '0';

  if (Math.abs(num) >= 100000000) {
    return Math.floor(num * 100 / 100000000) / 100 + '亿';
  }
  if (Math.abs(num) >= 10000000) {
    return Math.floor(num * 100 / 10000000) / 100 + '千万';
  }
  if (Math.abs(num) >= 1000000) {
    return Math.floor(num * 100 / 1000000) / 100 + '百万';
  }
  if (Math.abs(num) >= 10000) {
    return Math.floor(num * 100 / 10000) / 100 + '万';
  }
  return Math.floor(num * 100) / 100;
};

const groupedUsers = computed(() => {
  if (!topEarners.value.length) return [];
  const groups = [];
  for (let i = 0; i < topEarners.value.length; i += VISIBLE_COUNT) {
    groups.push(topEarners.value.slice(i, i + VISIBLE_COUNT));
  }
  // 如果最后一组不足3个，从头部补充
  // const lastGroup = groups[groups.length - 1];
  // if (lastGroup && lastGroup.length < VISIBLE_COUNT) {
  //   const remaining = VISIBLE_COUNT - lastGroup.length;
  //   groups[groups.length - 1] = [...lastGroup, ...topEarners.value.slice(0, remaining)];
  // }
  return groups;
});

const totalGroups = computed(() => groupedUsers.value.length);

const fetchTopEarners = async () => {
  try {
    const response = await api.post('/api/battle-royale/top-profits');
    topEarners.value = response.profits.map(user => ({
      ...user
    }));
  } catch (error) {
    console.error('获取top用户失败:', error);
  }
};

const startCarousel = () => {
  timer.value = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % totalGroups.value;
  }, SLIDE_INTERVAL);
};

const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024;
};

onMounted(async () => {
  await fetchTopEarners();
  if (topEarners.value.length > VISIBLE_COUNT) {
    startCarousel();
  }

  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.group:hover .group-hover\:scale-105 {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>