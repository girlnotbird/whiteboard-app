<script setup lang="ts">
import { useBoardSession } from '@/composables/BoardSession'
import { ref } from 'vue'
import BoardView from './BoardView.vue';

const props = defineProps<{
  boardName: string
}>()

const boardName = ref(props.boardName)
const { receiver, transmitter } = useBoardSession(boardName)

</script>

<template>
  <slot name="board-view">
    <BoardView :session="{receiver: receiver, transmitter: transmitter}"/>
  </slot>
</template>

<style scoped></style>
