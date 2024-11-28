<template>
  <div class="scifi-background">
    <div class="stars"></div>
    <div class="twinkling"></div>
    <div class="nebula"></div>
    <div class="grid"></div>
    <div class="floating-particles"></div>
  </div>
</template>

<style scoped>
.scifi-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(to bottom, #000428, #004e92);
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.stars:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
      radial-gradient(1px 1px at 10px 10px, #fff, rgba(0,0,0,0)),
      radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 30px 50px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
      radial-gradient(1px 1px at 50px 90px, #fff, rgba(0,0,0,0)),
      radial-gradient(1.5px 1.5px at 60px 110px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 70px 130px, #fff, rgba(0,0,0,0)),
      radial-gradient(1px 1px at 80px 150px, #fff, rgba(0,0,0,0)),
      radial-gradient(1.5px 1.5px at 90px 170px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 100px 190px, #fff, rgba(0,0,0,0));
  background-size: 200px 200px;
  background-repeat: repeat;
  animation: shine 20s linear infinite;
  opacity: 0.8;
}

.twinkling {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: twinkle 8s linear infinite;
  background: linear-gradient(45deg,
  rgba(63,94,251,0.1) 0%,
  rgba(70,135,252,0.1) 50%,
  rgba(63,94,251,0) 100%
  );
}

.nebula {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
      radial-gradient(circle at 30% 50%, rgba(123,31,162,0.2), transparent 40%),
      radial-gradient(circle at 70% 50%, rgba(32,156,238,0.2), transparent 40%);
  filter: blur(30px);
  animation: nebula-move 20s ease-in-out infinite alternate;
}

.grid {
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background-image:
      linear-gradient(rgba(63,94,251,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(63,94,251,0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(500px) rotateX(60deg);
  animation: grid-move 20s linear infinite;
}

.floating-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
      radial-gradient(2px 2px at 20px 30px, rgba(63,94,251,0.8), rgba(0,0,0,0)),
      radial-gradient(2px 2px at 40px 70px, rgba(32,156,238,0.8), rgba(0,0,0,0)),
      radial-gradient(2px 2px at 50px 160px, rgba(123,31,162,0.8), rgba(0,0,0,0)),
      radial-gradient(2px 2px at 90px 40px, rgba(63,94,251,0.8), rgba(0,0,0,0)),
      radial-gradient(2px 2px at 130px 80px, rgba(32,156,238,0.8), rgba(0,0,0,0)),
      radial-gradient(2px 2px at 160px 120px, rgba(123,31,162,0.8), rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: float 15s linear infinite;
  opacity: 0.5;
}

@keyframes shine {
  0% { background-position: 0 0; }
  100% { background-position: 200px 200px; }
}

@keyframes twinkle {
  0% { transform: rotate(0deg); opacity: 0.3; }
  25% { opacity: 0.5; }
  50% { opacity: 0.7; }
  75% { opacity: 0.5; }
  100% { transform: rotate(360deg); opacity: 0.3; }
}

@keyframes nebula-move {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes grid-move {
  0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
  100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}
</style>