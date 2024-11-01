<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { nanoid } from 'nanoid';

interface IShapeBase {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface IShapeRect extends IShapeBase {
  kind: 'rect';
}

interface IShapeCircle extends IShapeBase {
  kind: 'circle';
  center: {
    x: number;
    y: number;
  },
  radius: number;
}

type IShape = IShapeRect | IShapeCircle;

const offsetX = ref(0.0);
const offsetY = ref(0.0);

const mouseScreenX = ref(0.0);
const mouseScreenY = ref(0.0);

const windowWidth = ref(window.innerWidth);
const windowHeight = ref(window.innerHeight);

const viewBox = computed(() => {
  return `${offsetX.value} ${offsetY.value} ${windowWidth.value} ${windowHeight.value}`;
});

const cursorStyle = computed(() => {
  return `top: ${mouseScreenY.value}px; left: ${mouseScreenX.value}px;`;
});

const shapes = reactive<IShape[]>([]);

const onWindowResized = () => {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
};

const screenToBoardCoordinates = (pos: { x: number, y: number }) => {
  return { x: pos.x + offsetX.value, y: pos.y + offsetY.value };
};

const boardToScreenCoordinates = (pos: { x: number, y: number }) => {
  return { x: pos.x - offsetX.value, y: pos.y - offsetY.value };
};

const isDragging = ref(false);

const onMouseDown = (event: MouseEvent) => {
  switch (event.button) {
    case 0: // left click
    {
      const center = screenToBoardCoordinates({ x: event.clientX, y: event.clientY });
      shapes.push({
        id: nanoid(),
        kind: 'circle',
        boundingBox: {
          x: center.x - 20,
          y: center.y - 20,
          width: 40,
          height: 40,
        },
        center,
        radius: 20,
      });
      break;
    }
    case 1: // middle/wheel click
      isDragging.value = true;
      break;
    case 2: // right click
      break;
    default:
      break;
  }
};

const onMouseUp = () => {
  isDragging.value = false;
};

const onMouseMove = (event: MouseEvent) => {
  mouseScreenX.value = event.clientX;
  mouseScreenY.value = event.clientY;

  if (isDragging.value) {
    offsetX.value -= event.movementX;
    offsetY.value -= event.movementY;
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
  <svg class="cursor" :style="cursorStyle" viewBox="0 0 32 32" width="32" height="32">
    <path d="M0,0 L32,8 L16,16 L8,32 Z" fill="black"></path>
  </svg>

  <svg :width="windowWidth" :height="windowHeight" :viewBox="viewBox" class="board">
  // removed .value on windowWidth and windowHeight, vue automatically unwraps the refs
    <template v-for="shape in shapes">
      <circle v-if="shape.kind == 'circle'" :key="shape.id" :cx="shape.center.x" :cy="shape.center.y" :r="shape.radius"
              fill="red" />
      <rect v-if="shape.kind == 'rect'" :key="shape.id" :x="shape.boundingBox.x" :y="shape.boundingBox.y"
            :width="shape.boundingBox.width" :height="shape.boundingBox.height" fill="red" />
    </template>
  </svg>

  <div class="debug-info">
    <div>Offset: {{ offsetX }}, {{ offsetY }}</div>
    <div>Size: {{ windowWidth }}, {{ windowHeight }}</div>
    <div>Shapes: {{ shapes.length }}</div>
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
