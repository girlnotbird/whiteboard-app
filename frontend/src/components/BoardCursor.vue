<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  leftClick: [event: MouseEvent]
  rightClick: [event: MouseEvent]
  middleClick: [event: MouseEvent]
  dragStart: []
  dragEnd: []
  move: [event: MouseEvent]
}>()

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
  <slot name="cursor"></slot>
</template>

<style scoped></style>
