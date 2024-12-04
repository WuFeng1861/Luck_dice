<template>
  <div 
    v-if="show"
    class="character absolute transition-all duration-1000 ease-in-out"
    :style="{
      bottom: `${position.y}%`,
      right: `${position.x}%`,
      transform: `translate(50%, 50%) scale(${scale})`
    }"
  >
    <!-- Bet amount display -->
    <div class="bet-amount">
      <div class="chip-icon">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
      </div>
      <span class="chip-value">{{ betAmount }}</span>
    </div>

    <img 
      src="https://wufeng98.cn/imgweb/uploads/1732869328543-1732869257476-5706e6b54c88b4930cbd0ef58406a28-removebg-preview.png" 
      alt="Character"
      class="w-12 h-12 object-contain"
    >
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  targetRoom: Object,
  betAmount: {
    type: Number,
    default: 0
  }
})

const position = ref({ x: 10, y: 10 })
const scale = ref(1)

watch(() => props.targetRoom, (newRoom) => {
  if (newRoom) {
    const centerX = 100 - (newRoom.x + newRoom.width / 2)
    const centerY = 100 - (newRoom.y + newRoom.height / 2)
    position.value = { x: centerX, y: centerY }
    scale.value = Math.min(newRoom.width, newRoom.height) / 20
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
.character {
  z-index: 20;
  pointer-events: none;
}

.bet-amount {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 9999px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.chip-icon {
  color: #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>