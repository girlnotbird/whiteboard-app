<script setup lang="ts">
import { useMouseCoords } from '@/composables/MouseCoords'
import { computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  leftClick: [event: MouseEvent]
  rightClick: [event: MouseEvent]
  middleClick: [event: MouseEvent]
  dragStart: []
  dragEnd: []
  move: [event: MouseEvent]
}>()

const { x: mouseScreenX, y: mouseScreenY } = useMouseCoords()

const cursorStyle = computed(() => {
  return `top: ${mouseScreenY.value}px; left: ${mouseScreenX.value}px;`
})

function onMouseDown(event: MouseEvent) {
  switch (event.button) {
    case 0: // left click
      emit('leftClick', event)
      break
    case 1: // middle/wheel click
      emit('middleClick', event)
      emit('dragStart')
      break
    case 2: // right click
      emit('rightClick', event)
      emit('dragStart')
      break
    default:
      break
  }
}

function onMouseUp(event: MouseEvent) {
  switch (event.button) {
    case 0: // left click
      break;
    case 1: // middle/wheel click
    case 2: // right click
      emit('dragEnd')
      break;
    default:
      break;
  }
}

function onMouseMove(event: MouseEvent) {
  emit('move', event)
}

onMounted(() => {
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <svg
    class="cursor"
    :style="cursorStyle"
    viewBoxAttr="0 0 32 32"
    width="32"
    height="32"
  >
    <path d="M0,0 L32,8 L16,16 L8,32 Z" fill="black"></path>
  </svg>
</template>

<style scoped></style>
