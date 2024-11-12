<script setup lang="ts">
import { ref, reactive } from 'vue'
import { nanoid } from 'nanoid'

import {
  type IBoardElement,
  type IBoardElementCircle,
} from '@liveboard/common/src/board-elements'

import { isDrawCircleEvent, type IDrawCircleEvent } from '@liveboard/common/src/board-events'

import { useViewBox } from '../composables/ViewBox'
import { screenToBoardCoordinates } from '../utils/ConvertCoords'
import BoardCursor from '../components/BoardCursor.vue'

import type { Observable } from 'rxjs'
import type { WebSocketSubject } from 'rxjs/webSocket'

const props = defineProps<{
  session: {
    receiver: Observable<unknown>
    transmitter: WebSocketSubject<unknown>
  }
}>()
const { receiver, transmitter } = props.session

const boardElements = reactive<IBoardElement[]>([])

const { windowWidth, windowHeight, offsetX, offsetY, viewBox } = useViewBox()

receiver.subscribe({
  next: (val) => {
    if (typeof val !== "string") { return; }
    const eventObj = JSON.parse(val);
    if(isDrawCircleEvent(eventObj)) {
      boardElements.push(eventObj.shape);
    }
  }
})

function drawCircle(event: MouseEvent) {
  const center = screenToBoardCoordinates(
    {
      x: event.clientX,
      y: event.clientY,
    },
    {
      x: offsetX.value,
      y: offsetY.value,
    },
  )

  const circle: IBoardElementCircle = {
    id: nanoid(),
    kind: 'circle',
    cx: center.x,
    cy: center.y,
    radius: 5,
  }

  transmitter.next(
    JSON.stringify({
      eventType: 'draw-circle',
      shape: circle,
    } as IDrawCircleEvent),
  )
}

// Viewbox dragging behavior
const isDragging = ref(false)
const startDrag = () => {
  isDragging.value = true
}
const dragViewbox = (event: MouseEvent) => {
  if (isDragging.value) {
    offsetX.value -= event.movementX
    offsetY.value -= event.movementY
  }
}
const endDrag = () => {
  isDragging.value = false
}
</script>

<template>
  <!-- Renderless Cursor Component -->
  <BoardCursor
    @leftClick="drawCircle"
    @dragStart="startDrag"
    @move="dragViewbox"
    @dragEnd="endDrag"
  />

  <!-- Board View -->
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
