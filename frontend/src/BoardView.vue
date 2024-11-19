<script lang="ts">
export interface MouseEventWithPos {
  x: number
  y: number
}

export interface MouseEventWithPosAndBtn extends MouseEventWithPos {
  button: number
}

export interface KeyEventWithKey {
  key: string
}
</script>

<script setup lang="ts">
import {
  ref,
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onBeforeUnmount,
} from 'vue'

import {type IBoardElement} from '@liveboard/common/src/board-elements'
import {useResizeObserver} from '@vueuse/core'

const props = defineProps<{
  elements: Map<string,IBoardElement>
}>()

const emit = defineEmits<{
  boardMouseDown: [MouseEventWithPosAndBtn]
  boardMouseMove: [MouseEventWithPos]
  boardMouseUp: [MouseEventWithPosAndBtn]
  boardKeyDown: [KeyEventWithKey]
  boardKeyUp: [KeyEventWithKey]
}>()

const svgRoot = ref<SVGElement>()

const viewZoom = ref(1.0)
const viewOuterWidth = ref(0)
const viewOuterHeight = ref(0)
const viewOuterOffsetX = ref(0)
const viewOuterOffsetY = ref(0)
const viewInnerOffsetX = ref(0)
const viewInnerOffsetY = ref(0)

const mousePos = ref({x: 0, y: 0})

useResizeObserver(svgRoot, entries => {
  const rect = entries[0]!.contentRect
  viewOuterWidth.value = rect.width
  viewOuterHeight.value = rect.height
  viewOuterOffsetX.value = rect.x
  viewOuterOffsetY.value = rect.y
})

const viewBox = computed(() => {
  const offX = viewInnerOffsetX.value
  const offY = viewInnerOffsetY.value
  const width = viewOuterWidth.value / viewZoom.value
  const height = viewOuterHeight.value / viewZoom.value
  return `${offX} ${offY} ${width} ${height}`
})

const offsetToBoard = (offsetX: number, offsetY: number) => {
  return {
    x: viewInnerOffsetX.value - viewOuterOffsetX.value + (offsetX / viewZoom.value),
    y: viewInnerOffsetY.value - viewOuterOffsetY.value + (offsetY / viewZoom.value)
  }
}

// const pageToBoardCoord = (pageX: number, pageY: number) => {
//   const x =
//     viewInnerOffsetX.value + (pageX - viewOuterOffsetX.value) / viewZoom.value
//   const y =
//     viewInnerOffsetY.value + (pageY - viewOuterOffsetY.value) / viewZoom.value
//   return {x, y}
// }

const onMouseDown = (evt: MouseEvent) =>
  emit('boardMouseDown', {
    ...offsetToBoard(evt.offsetX, evt.offsetY),
    button: evt.button,
  })

const onMouseMove = (evt: MouseEvent) => {
  mousePos.value = offsetToBoard(evt.offsetX, evt.offsetY);
  emit('boardMouseMove', {
    ...offsetToBoard(evt.offsetX, evt.offsetY),
  })
}

const onMouseUp = (evt: MouseEvent) =>
  emit('boardMouseUp', {
    ...offsetToBoard(evt.offsetX, evt.offsetY),
    button: evt.button,
  })

const onKeyDown = (evt: KeyboardEvent) => emit('boardKeyDown', {key: evt.key})
const onKeyUp = (evt: KeyboardEvent) => emit('boardKeyUp', {key: evt.key})


const onWheelScroll = (evt: WheelEvent) => {
  const oldFocus = offsetToBoard(evt.offsetX, evt.offsetY)
  viewZoom.value += evt.deltaY / 100.0
  viewZoom.value = Math.max(Math.min(viewZoom.value, 16.0), 0.02)

  const newFocus = offsetToBoard(evt.offsetX, evt.offsetY)
  viewInnerOffsetX.value -= newFocus.x - oldFocus.x
  viewInnerOffsetY.value -= newFocus.y - oldFocus.y
}

onMounted(() => {
  svgRoot.value?.addEventListener('mousedown', onMouseDown)
  svgRoot.value?.addEventListener('mousemove', onMouseMove)
  svgRoot.value?.addEventListener('mouseup', onMouseUp)
  svgRoot.value?.addEventListener('wheel', onWheelScroll)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})

onBeforeUnmount(() => {
  svgRoot.value?.removeEventListener('mousedown', onMouseDown)
  svgRoot.value?.removeEventListener('mousemove', onMouseMove)
  svgRoot.value?.removeEventListener('mouseup', onMouseUp)
  svgRoot.value?.removeEventListener('wheel', onWheelScroll)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
.board-view {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
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
  pointer-events: none;
}
</style>

<template>
  <svg
    ref="svgRoot"
    class="board-view"
    :width="viewOuterWidth"
    :height="viewOuterHeight"
    :viewBox="viewBox"
    @contextmenu.prevent="true"
  >
    <rect x="100" y="100" width="300" height="200" fill="red"/>
    <circle cx="200" cy="400" r="128" fill="orange"/>

    <template v-for="[_id, elt] in props.elements">
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
    <div>
      offset: {{ viewInnerOffsetX.toFixed(2) }},
      {{ viewInnerOffsetY.toFixed(2) }}
    </div>
    <div>
      mouse: {{ mousePos }}
    </div>
    <div>
      size: {{ viewOuterWidth.toFixed(2) }}, {{ viewOuterHeight.toFixed(2) }}
    </div>
    <div>zoom: {{ viewZoom.toFixed(2) }}</div>
  </div>
</template>
