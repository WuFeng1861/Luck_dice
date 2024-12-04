<template>
  <div class="relative w-full aspect-[428/521] bg-gray-800 rounded-lg overflow-hidden">
    <img src="https://wufeng98.cn/imgweb/uploads/1733232946066-0beb2223ec5bf442b2e62899ef5a43b.jpg" alt="Room Map" class="w-full h-full object-cover">
    
    <!-- Timer Display -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white font-bold">
      <span v-if="[GAME_STATES.WAITING, GAME_STATES.RUNNING].includes(gameState)">选择躲避房间: {{ formatTime(remainingTime) }}</span>
      <span v-else-if="gameState === GAME_STATES.SETTLING">开奖中...</span>
      <span v-else>等待开始...</span>
    </div>

    <div 
      v-for="(room, index) in rooms" 
      :key="index+room.chips+room.isWinner.toString()"
      :style="{
        position: 'absolute',
        left: `${room.x}%`,
        top: `${room.y}%`,
        width: `${room.width}%`,
        height: `${room.height}%`
      }"
      :class="[
        'room-box cursor-pointer transition-all duration-300',
        selectedRooms.includes(index) ? 'selected' : '',
        room.isWinner ? 'winner' : '',
        ![GAME_STATES.RUNNING, GAME_STATES.WAITING].includes(gameState)  ? 'pointer-events-none' : ''
      ]"
      @click="$emit('select-room', index)"
    >
      <!-- Chip amount display -->
      <div class="chip-amount">
        <div class="chip-icon">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
          </svg>
        </div>
        <span class="chip-value">{{ room.chips || 0 }}</span>
      </div>

      <div class="room-content">
        <span class="room-number">{{ index + 1 }}</span>
      </div>

      <!-- Winner indicator -->
      <div v-if="room.isWinner" class="winner-indicator">
        <span class="text-yellow-300 font-bold text-lg">Last Winner!</span>
      </div>
    </div>

    <Character 
      v-for="(bet, index) in activeBets"
      :key="index + bet.amount"
      :show="true"
      :target-room="rooms[bet.roomIndex]"
      :bet-amount="bet.amount"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import Character from './Character.vue'
import {GAME_STATES} from "@/constants/gameConstants.js";

const props = defineProps({
  rooms: {
    type: Array,
    required: true
  },
  selectedRooms: {
    type: Array,
    default: () => []
  },
  activeBets: {
    type: Array,
    default: () => []
  },
  gameState: {
    type: String,
    default: 'waiting'
  },
  remainingTime: {
    type: Number,
    default: 0
  }
})

defineEmits(['select-room'])

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.room-box {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  background: transparent;
}

.room-box:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(2px);
}

.room-box.selected {
  border-color: rgba(74, 222, 128, 0.5);
  background: rgba(74, 222, 128, 0.1);
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.4);
  backdrop-filter: blur(2px);
}

.room-box.winner {
  border-color: rgba(234, 179, 8, 0.8);
  background: rgba(234, 179, 8, 0.2);
  box-shadow: 0 0 30px rgba(234, 179, 8, 0.6);
  animation: pulse 2s infinite;
}

.chip-amount {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px 8px;
  border-radius: 9999px;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.chip-icon {
  color: #ffd700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.room-box:hover .room-content,
.room-box.selected .room-content {
  opacity: 1;
}

.room-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.selected .room-number {
  color: rgb(74, 222, 128);
  text-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
}

.winner-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 30px rgba(234, 179, 8, 0.6);
  }
  50% {
    box-shadow: 0 0 50px rgba(234, 179, 8, 0.8);
  }
}
</style>