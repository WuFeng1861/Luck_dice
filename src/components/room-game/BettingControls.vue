<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      <div class="relative w-full sm:w-auto">
        <input
          type="number"
          :value="modelValue"
          @input="$emit('update:modelValue', Number($event.target.value))"
          :max="maxBet"
          min="1"
          class="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          筹码
        </span>
      </div>
      <button
        @click="$emit('bet')"
        :disabled="!canBet"
        class="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        下注
      </button>
    </div>

    <div class="flex justify-center gap-2 flex-wrap">
      <button
        v-for="amount in quickBets"
        :key="amount"
        @click="$emit('update:modelValue', amount)"
        class="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors text-sm sm:text-base"
      >
        {{ amount }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  maxBet: {
    type: Number,
    required: true
  },
  canBet: {
    type: Boolean,
    required: true
  },
  quickBets: {
    type: Array,
    default: () => [10, 50, 100, 500]
  }
})

defineEmits(['update:modelValue', 'bet'])
</script>