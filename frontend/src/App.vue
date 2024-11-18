<script setup lang="ts">
import { ref } from 'vue'
import BoardSession from './BoardSession.vue'

const boardName = ref('some-board')
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
    <BoardSession :boardName="boardName" />
  </div>
</template>
