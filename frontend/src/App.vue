<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { nanoid } from 'nanoid'
import { type IBoardElement } from '@liveboard/common/src/board-elements'
import { isOpenWebSocket, useBoard } from './composables/Board';
import { isDrawShapeEvent, type DrawShapeEvent } from './types/types';

const offsetX = ref(0.0)
const offsetY = ref(0.0)

const mouseScreenX = ref(0.0)
const mouseScreenY = ref(0.0)

const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

const board = useBoard('board');

const viewBox = computed(() => {
  return `${offsetX.value} ${offsetY.value} ${windowWidth.value} ${windowHeight.value}`
})

const cursorStyle = computed(() => {
  return `top: ${mouseScreenY.value}px; left: ${mouseScreenX.value}px;`
})

const boardElements = reactive<IBoardElement[]>([])

const onWindowResized = () => {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const screenToBoardCoordinates = (pos: { x: number; y: number }) => {
  return { x: pos.x + offsetX.value, y: pos.y + offsetY.value }
}

const _boardToScreenCoordinates = (pos: { x: number; y: number }) => {
  return { x: pos.x - offsetX.value, y: pos.y - offsetY.value }
}

const isDragging = ref(false)

const onMouseDown = (event: MouseEvent) => {
  switch (event.button) {
    case 0: {
      // left click
      const center = screenToBoardCoordinates({
        x: event.clientX,
        y: event.clientY,
      })
      const circle = {
        id: nanoid(),
        kind: 'circle' as const,
        cx: center.x,
        cy: center.y,
        radius: 5,
      }
      boardElements.push(circle);
      if (isOpenWebSocket(board.socket)) {
        const boardEvent: DrawShapeEvent = {
          eventType: "draw-shape",
          shape: circle
        }
        board.socket.send(JSON.stringify(boardEvent));
      }
      break
    }
    case 1: // middle/wheel click
    case 2: // right click
      isDragging.value = true
      break
    default:
      break
  }
}

const onMouseUp = () => {
  isDragging.value = false
}

const onMouseMove = (event: MouseEvent) => {
  mouseScreenX.value = event.clientX
  mouseScreenY.value = event.clientY

  if (isDragging.value) {
    offsetX.value -= event.movementX
    offsetY.value -= event.movementY
  }
}

onMounted(() => {

  window.addEventListener('resize', onWindowResized)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)

  board.connect();
  board.socket?.addEventListener('message', (messageEvent) => {
    const data: unknown = JSON.parse(messageEvent.data);
    if (isDrawShapeEvent(data)) {
      boardElements.push(data.shape);
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResized)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mousemove', onMouseMove)
  board.disconnect();
})

</script>

<template>
  <svg
    class="cursor"
    :style="cursorStyle"
    viewBox="0 0 32 32"
    width="32"
    height="32"
  >
    <path d="M0,0 L32,8 L16,16 L8,32 Z" fill="black"></path>
  </svg>

  <svg
    :width="windowWidth"
    :height="windowHeight"
    :viewBox="viewBox"
    class="board"
    @contextmenu.prevent="true"
  >
    <template v-for="elt in boardElements">
      <circle
        v-if="elt.kind == 'circle'"
        :key="elt.id"
        :cx="elt.cx"
        :cy="elt.cy"
        :r="elt.radius"
        :fill="elt.style?.fillColor ?? 'black'"
        :stroke="elt.style?.strokeColor ?? undefined"
        :stroke-width="elt.style?.strokeWidth ?? undefined"
      />
      <rect
        v-if="elt.kind == 'rectangle'"
        :key="elt.id"
        :x="elt.x"
        :y="elt.y"
        :width="elt.width"
        :height="elt.height"
        :fill="elt.style?.fillColor ?? 'black'"
        :stroke="elt.style?.strokeColor ?? undefined"
        :stroke-width="elt.style?.strokeWidth ?? undefined"
      />
    </template>
  </svg>

  <div class="debug-info">
    <div>Offset: {{ offsetX }}, {{ offsetY }}</div>
    <div>Size: {{ windowWidth }}, {{ windowHeight }}</div>
    <div>Elems: {{ boardElements.length }}</div>
  </div>
</template>

<style scoped>
* {
  cursor: none !important;
}

.board {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
}

.cursor {
  position: absolute;
  z-index: 101;
}

.debug-info {
  position: absolute;
  z-index: 100;
  top: 1em;
  left: 1em;
  margin: 0;
  padding: 10px;

  color: red;
  border: 1px solid black;
  background-color: white;
  opacity: 0.6;
}
</style>
