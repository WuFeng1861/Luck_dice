<template>
  <div class="flex justify-center items-center gap-4 sm:gap-20">
    <!-- 龙 -->
    <div class="relative group">
      <div class="w-24 sm:w-32 h-36 sm:h-48 rounded-lg shadow-lg transform transition-all duration-300 group-hover:scale-110">
        <div class="w-full h-full relative">
          <!-- 卡片背景 -->
          <div class="absolute inset-0 bg-white rounded-lg border-2 border-gray-200"></div>
          <!-- 卡片内容 -->
          <div v-if="showCards" class="absolute inset-0 flex flex-col items-center justify-between p-2">
            <!-- 左上角数字/字母 -->
            <div class="absolute left-2 top-2 text-xl sm:text-2xl font-bold" :class="getCardColor(result?.dragonCard)">
              {{ getCardDisplay(result?.dragonCard) }}
              <div class="text-xl sm:text-2xl">{{ getCardSuit(result?.dragonCard) }}</div>
            </div>
            <!-- 中间花色 -->
            <div class="flex-1 flex items-center justify-center text-4xl sm:text-6xl" :class="getCardColor(result?.dragonCard)">
              {{ getCardSuit(result?.dragonCard) }}
            </div>
            <!-- 右下角数字/字母 -->
            <div class="absolute right-2 bottom-2 text-xl sm:text-2xl font-bold" :class="getCardColor(result?.dragonCard)">
              <div class="text-xl sm:text-2xl text-right">{{ getCardSuit(result?.dragonCard) }}</div>
              {{ getCardDisplay(result?.dragonCard) }}
            </div>
          </div>
          <!-- 未开牌时显示龙图片 -->
          <img
              v-else
              src="@/assets/cards/dragon.png"
              alt="龙"
              class="absolute inset-0 w-full h-full object-cover rounded-lg"
          >
        </div>
      </div>
      <div class="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-red-600 font-bold text-base sm:text-lg">
        龙
      </div>
    </div>

    <!-- VS -->
    <div class="relative">
      <div class="text-2xl sm:text-4xl font-bold text-gray-700 animate-pulse">
        VS
      </div>
      <div class="absolute -left-6 sm:-left-10 -right-6 sm:-right-10 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
    </div>

    <!-- 虎 -->
    <div class="relative group">
      <div class="w-24 sm:w-32 h-36 sm:h-48 rounded-lg shadow-lg transform transition-all duration-300 group-hover:scale-110">
        <div class="w-full h-full relative">
          <!-- 卡片背景 -->
          <div class="absolute inset-0 bg-white rounded-lg border-2 border-gray-200"></div>
          <!-- 卡片内容 -->
          <div v-if="showCards" class="absolute inset-0 flex flex-col items-center justify-between p-2">
            <!-- 左上角数字/字母 -->
            <div class="absolute left-2 top-2 text-xl sm:text-2xl font-bold" :class="getCardColor(result?.tigerCard)">
              {{ getCardDisplay(result?.tigerCard) }}
              <div class="text-xl sm:text-2xl">{{ getCardSuit(result?.tigerCard) }}</div>
            </div>
            <!-- 中间花色 -->
            <div class="flex-1 flex items-center justify-center text-4xl sm:text-6xl" :class="getCardColor(result?.tigerCard)">
              {{ getCardSuit(result?.tigerCard) }}
            </div>
            <!-- 右下角数字/字母 -->
            <div class="absolute right-2 bottom-2 text-xl sm:text-2xl font-bold" :class="getCardColor(result?.tigerCard)">
              <div class="text-xl sm:text-2xl text-right">{{ getCardSuit(result?.tigerCard) }}</div>
              {{ getCardDisplay(result?.tigerCard) }}
            </div>
          </div>
          <!-- 未开牌时显示虎图片 -->
          <img
              v-else
              src="@/assets/cards/tiger.png"
              alt="虎"
              class="absolute inset-0 w-full h-full object-cover rounded-lg"
          >
        </div>
      </div>
      <div class="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-yellow-600 font-bold text-base sm:text-lg">
        虎
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  result: {
    type: Object,
    default: null
  },
  showCards: {
    type: Boolean,
    default: false
  }
});

const getCardDisplay = (cardNumber) => {
  const cardNames = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K'
  };
  return cardNames[cardNumber] || cardNumber;
};

const getCardSuit = (cardNumber) => {
  const suits = ['♠', '♥', '♣', '♦'];
  return suits[cardNumber % 4];
};

const getCardColor = (cardNumber) => {
  return cardNumber % 2 === 0 ? 'text-red-600' : 'text-gray-900';
};
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.group {
  animation: float 3s ease-in-out infinite;
}

.group:last-child {
  animation-delay: -1.5s;
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.group:hover .shadow-lg {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>