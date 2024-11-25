<template>
  <div ref="container" class="dice-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

const container = ref(null);
let scene, camera, renderer, dice;
let animationFrameId;
let isRolling = false;

// 初始化场景
const init = () => {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  
  // 调整相机位置
  camera = new THREE.PerspectiveCamera(
    50,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 6, 8);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.value.appendChild(renderer.domElement);
  
  // 增强环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);
  
  // 主光源 - 使用平行光替代聚光灯
  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(0, 20, 0);
  mainLight.castShadow = true;
  
  // 设置阴影参数
  mainLight.shadow.camera.left = -10;
  mainLight.shadow.camera.right = 10;
  mainLight.shadow.camera.top = 10;
  mainLight.shadow.camera.bottom = -10;
  mainLight.shadow.camera.near = 1;
  mainLight.shadow.camera.far = 50;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.bias = -0.001;
  
  scene.add(mainLight);
  
  // 添加更大的地面
  const groundGeometry = new THREE.PlaneGeometry(40, 40);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // 添加四周的辅助光源 - 不产生阴影
  const createFillLight = (x, z, intensity) => {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.position.set(x, 12, z);
    light.castShadow = false; // 辅助光源不产生阴影
    scene.add(light);
  };

  // 增加四个角的补光强度
  createFillLight(15, 15, 0.5);
  createFillLight(-15, 15, 0.5);
  createFillLight(15, -15, 0.5);
  createFillLight(-15, -15, 0.5);
  
  // 添加顶部补充光源 - 不产生阴影
  const topFillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  topFillLight.position.set(0, 20, 0);
  topFillLight.castShadow = false;
  scene.add(topFillLight);
  
  createDice();
};

// 创建骰子材质
const createDiceMaterial = (number) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  
  // 创建带有边缘渐变的红色背景
  const bgGradient = context.createRadialGradient(256, 256, 0, 256, 256, 362);
  bgGradient.addColorStop(0, '#ff0000');    // 中心红色
  bgGradient.addColorStop(0.8, '#ff0000');  // 保持红色
  bgGradient.addColorStop(1, '#cc0000');    // 边缘稍暗
  context.fillStyle = bgGradient;
  context.fillRect(0, 0, 512, 512);
  
  // 添加内部阴影效果，让红色更有层次感
  context.shadowBlur = 20;
  context.shadowColor = 'rgba(0, 0, 0, 0.3)';
  context.shadowOffsetX = 10;
  context.shadowOffsetY = 10;
  
  // 添加高光效果
  const highlight = context.createLinearGradient(0, 0, 512, 512);
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  highlight.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  context.fillStyle = highlight;
  context.fillRect(0, 0, 512, 512);
  
  // 重置阴影效果
  context.shadowBlur = 0;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  
  // 绘制白色圆点
  const dots = getDotPositions(number);
  dots.forEach(([x, y]) => {
    // 白色圆点
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.arc(x, y, 40, 0, Math.PI * 2);
    context.fill();
    
    // 添加点的内部阴影，让点更有立体感
    const dotHighlight = context.createRadialGradient(x - 10, y - 10, 0, x, y, 40);
    dotHighlight.addColorStop(0, 'rgba(255, 255, 255, 1)');
    dotHighlight.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)');
    dotHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    
    context.fillStyle = dotHighlight;
    context.beginPath();
    context.arc(x, y, 40, 0, Math.PI * 2);
    context.fill();
  });
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  return new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.1,        // 更光滑
    metalness: 0.2,        // 适当的金属感
    envMapIntensity: 1.2,  // 增强环境反射
    side: THREE.FrontSide
  });
};

// 获取点的位置 - 调整点的间距
const getDotPositions = (number) => {
  const center = 256;
  const offset = 140;  // 增大偏移量，让点的分布更接近图片
  
  const positions = {
    1: [[center, center]],
    2: [[center - offset, center - offset], [center + offset, center + offset]],
    3: [[center - offset, center - offset], [center, center], [center + offset, center + offset]],
    4: [[center - offset, center - offset], [center - offset, center + offset],
        [center + offset, center - offset], [center + offset, center + offset]],
    5: [[center - offset, center - offset], [center - offset, center + offset],
        [center, center],
        [center + offset, center - offset], [center + offset, center + offset]],
    6: [[center - offset, center - offset], [center - offset, center],
        [center - offset, center + offset], [center + offset, center - offset],
        [center + offset, center], [center + offset, center + offset]]
  };
  return positions[number];
};

// 创建骰子
const createDice = () => {
  // 使用普通的立方体几何体，不进行顶点处理
  const geometry = new THREE.BoxGeometry(2, 2, 2);

  const materials = [
    createDiceMaterial(6),
    createDiceMaterial(1),
    createDiceMaterial(5),
    createDiceMaterial(2),
    createDiceMaterial(4),
    createDiceMaterial(3)
  ];
  
  // 调整材质参数
  materials.forEach(material => {
    material.roughness = 0.05;    // 保持光滑度
    material.metalness = 0.15;    // 保持金属感
    material.envMapIntensity = 1.5; // 保持环境反射
  });
  
  dice = new THREE.Mesh(geometry, materials);
  dice.castShadow = true;
  dice.receiveShadow = true;
  
  // 添加边缘高光效果，但不进行圆角处理
  const edgeGeometry = new THREE.BoxGeometry(2.02, 2.02, 2.02);
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xff1111,
    roughness: 0,
    metalness: 0.5,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  });
  
  const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  dice.add(edge);
  
  scene.add(dice);
  
  dice.position.y = 0.5;
  dice.rotation.set(0, 0, 0);
};

// 获取目标旋转角度
const getTargetRotation = (number) => {
  const rotations = {
    1: { x: 0, y: Math.PI/2, z: 0 },        // 1点朝左
    2: { x: -Math.PI/2, y: 0, z: 0 },     // 2点朝下
    3: { x: 0, y: Math.PI, z: 0 },     // 3点朝后
    4: { x: 0, y: 0, z: 0 },      // 4点朝前
    5: { x: Math.PI/2, y: 0, z: 0 },      // 5点朝上
    6: { x: 0, y: -Math.PI/2, z: 0 }               // 6点朝右
  };
  return rotations[number];
};

// 掷骰子动画
const rollDice = async (targetNumber) => {
  if (isRolling) return;
  console.log('目标点数:', targetNumber);
  
  isRolling = true;
  const duration = 2500;
  const startTime = Date.now();
  
  // 获取目标旋转角度
  const targetRotation = getTargetRotation(targetNumber);
  
  // 添加额外旋转
  const extraRotations = Math.PI * 4;
  Object.keys(targetRotation).forEach(axis => {
    targetRotation[axis] += extraRotations;
  });
  
  return new Promise(resolve => {
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      // 更新跳跃高度和水平位置
      const jumpHeight = Math.sin(progress * Math.PI * 3) * (1 - progress) * 4;
      const horizontalOffset = Math.sin(progress * Math.PI * 2) * (1 - progress) * 2;
      
      // 更新骰子位置，确保最低点不会低于地面
      dice.position.set(
        horizontalOffset,
        Math.max(0.5, jumpHeight + 0.5), // 保持最低高度为0.5
        0
      );
      
      // 动态旋转速度
      const rotationSpeed = (1 - progress) * 2 + 0.5;
      dice.rotation.x = targetRotation.x * easeProgress + Math.sin(elapsed * 0.005) * rotationSpeed;
      dice.rotation.y = targetRotation.y * easeProgress + Math.cos(elapsed * 0.005) * rotationSpeed;
      dice.rotation.z = targetRotation.z * easeProgress + Math.sin(elapsed * 0.003) * rotationSpeed;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画结束时的最终位置
        dice.position.set(0, 0.5, 0); // 保持在地面上方
        const finalRotation = getTargetRotation(targetNumber);
        dice.rotation.set(
          finalRotation.x,
          finalRotation.y,
          finalRotation.z
        );
        isRolling = false;
        resolve();
      }
    };
    animate();
  });
};

// 渲染循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

onMounted(() => {
  init();
  animate();
  
  window.addEventListener('resize', () => {
    if (container.value) {
      camera.aspect = container.value.clientWidth / container.value.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    }
  });
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  if (renderer) {
    renderer.dispose();
  }
});

defineExpose({
  rollDice
});
</script>

<style scoped>
.dice-container {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.03);
}
</style> 