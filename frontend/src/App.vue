<script setup lang="ts">
import {ref, reactive} from 'vue'
import {nanoid} from 'nanoid'
import BoardView, {
  type MouseEventWithPos,
  type MouseEventWithPosAndBtn,
  type KeyEventWithKey,
} from './BoardView.vue'

import {type IBoardElement} from '@liveboard/common/src/board-elements'

const boardElements = reactive<IBoardElement[]>([])

const onMouseDown = (evt: MouseEventWithPosAndBtn) => {
  switch (evt.button) {
    case 0: {
      boardElements.push({
        id: nanoid(),
        kind: 'circle',
        cx: evt.x,
        cy: evt.y,
        radius: 5,
      })
      break
    }
    case 1: // middle/wheel click
    case 2: // right click
      break
    default:
      break
  }
}
</script>

<style scoped>
.board-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  background-color: maroon;
}
</style>

<template>
  <div class="board-container">
    <BoardView ref="boardView" :elements="boardElements" @boardMouseDown="onMouseDown"/>
  </div>
</template>
