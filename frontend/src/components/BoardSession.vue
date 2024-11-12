<script setup lang="ts">
import { useBoardSession } from '@/composables/BoardSession';
import { from, useSubscription, useSubject } from '@vueuse/rxjs'
import { Subject, switchMap, finalize } from 'rxjs'
import { computed, ref } from 'vue'

const props = defineProps<{
  boardName: string
}>()

const boardName = ref(props.boardName);
const {receiver, transmitter} = useBoardSession(boardName);


</script>

<template>
  <slot name="session"></slot>
</template>

<style scoped></style>
