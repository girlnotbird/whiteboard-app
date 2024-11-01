<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const offsetX = ref(0.0);
const offsetY = ref(0.0);

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const viewBox = computed(() => {
  return `${offsetX.value} ${offsetY.value} ${windowWidth.value} ${windowHeight.value}`;
});

const onWindowResized = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};


let isDragging = false;
let lastDragX = 0.0;
let lastDragY = 0.0;

const onMouseDown = (event: MouseEvent) => {
  isDragging = true;
  lastDragX = event.clientX;
  lastDragY = event.clientY;
};

const onMouseUp = () => {
  isDragging = false;
};

const onMouseMove = (event: MouseEvent) => {
  if (isDragging) {
    offsetX.value -= event.clientX - lastDragX;
    offsetY.value -= event.clientY - lastDragY;
    lastDragX = event.clientX;
    lastDragY = event.clientY;
    console.log(`drag occurred @ ${lastDragX}, ${lastDragY}`);
  }
};

onMounted(() => {
  window.addEventListener('resize', onWindowResized);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResized);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mousemove', onMouseMove);
});
</script>

<template>
  <svg :width="windowWidth.value" :height="windowHeight.value" :viewBox="viewBox">
    <circle cx="200" cy="200" r="50" fill="red"></circle>
    <rect x="400" y="300" width="100" height="50" fill="green" />
  </svg>
</template>

<style scoped>
.board {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
}
</style>
