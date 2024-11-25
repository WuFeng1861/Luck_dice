<template>
  <div class="dice-container" :class="{ 'rolling': isRolling }">
    <div class="dice" :class="[`show-${currentFace}`]">
      <div class="face one">
        <div class="dot center"></div>
      </div>
      <div class="face two">
        <div class="dot top right"></div>
        <div class="dot bottom left"></div>
      </div>
      <div class="face three">
        <div class="dot top left"></div>
        <div class="dot center"></div>
        <div class="dot bottom right"></div>
      </div>
      <div class="face four">
        <div class="dot top left"></div>
        <div class="dot top right"></div>
        <div class="dot bottom left"></div>
        <div class="dot bottom right"></div>
      </div>
      <div class="face five">
        <div class="dot top left"></div>
        <div class="dot top right"></div>
        <div class="dot center"></div>
        <div class="dot bottom left"></div>
        <div class="dot bottom right"></div>
      </div>
      <div class="face six">
        <div class="dot top left"></div>
        <div class="dot top right"></div>
        <div class="dot center left"></div>
        <div class="dot center right"></div>
        <div class="dot bottom left"></div>
        <div class="dot bottom right"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dice',
  props: {
    isRolling: Boolean,
    currentFace: {
      type: Number,
      default: 1
    }
  }
}
</script>

<style scoped>
.dice-container {
  perspective: 1000px;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.dice {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 1s ease-out;
}

.rolling {
  animation: rolling 3s ease-in-out;
}

@keyframes rolling {
  0% { transform: rotateX(0) rotateY(0) rotateZ(0); }
  25% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
  50% { transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg); }
  75% { transform: rotateX(1080deg) rotateY(540deg) rotateZ(270deg); }
  100% { transform: rotateX(1440deg) rotateY(720deg) rotateZ(360deg); }
}

.dice.show-1 { transform: rotateX(0) rotateY(0); }
.dice.show-2 { transform: rotateY(-90deg); }
.dice.show-3 { transform: rotateY(90deg); }
.dice.show-4 { transform: rotateX(90deg); }
.dice.show-5 { transform: rotateX(-90deg); }
.dice.show-6 { transform: rotateX(180deg); }

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border: 2px solid #999;
  border-radius: 10px;
  display: grid;
  grid-template: repeat(3, 1fr) / repeat(3, 1fr);
  gap: 4px;
  padding: 8px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.dot {
  background: #333;
  border-radius: 50%;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
}

.one { transform: translateZ(50px); }
.two { transform: translateX(-50px) rotateY(-90deg); }
.three { transform: translateX(50px) rotateY(90deg); }
.four { transform: translateY(-50px) rotateX(90deg); }
.five { transform: translateY(50px) rotateX(-90deg); }
.six { transform: translateZ(-50px) rotateX(180deg); }

.center { grid-area: 2 / 2 / 3 / 3; }
.top.left { grid-area: 1 / 1 / 2 / 2; }
.top.right { grid-area: 1 / 3 / 2 / 4; }
.bottom.left { grid-area: 3 / 1 / 4 / 2; }
.bottom.right { grid-area: 3 / 3 / 4 / 4; }
.center.left { grid-area: 2 / 1 / 3 / 2; }
.center.right { grid-area: 2 / 3 / 3 / 4; }

.face {
  background: linear-gradient(145deg, #ffffff, #e6e6e6);
}

.dot {
  background: linear-gradient(145deg, #1a1a1a, #333333);
  transform: translateZ(1px);
}

.dice {
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes rolling {
  0% { 
    transform: rotateX(0) rotateY(0) rotateZ(0); 
  }
  20% { 
    transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); 
  }
  40% { 
    transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg); 
  }
  60% { 
    transform: rotateX(1080deg) rotateY(540deg) rotateZ(270deg); 
  }
  80% { 
    transform: rotateX(1440deg) rotateY(720deg) rotateZ(360deg); 
  }
  100% { 
    transform: rotateX(1800deg) rotateY(900deg) rotateZ(450deg); 
  }
}

.rolling .dice {
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style> 