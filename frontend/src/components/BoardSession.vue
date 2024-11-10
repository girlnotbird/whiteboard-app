<script setup lang="ts">
import { webSocket, type WebSocketSubject } from 'rxjs/webSocket'
import { from, useSubscription, useSubject } from '@vueuse/rxjs'
import { Subject, switchMap, finalize } from 'rxjs'
import { computed, type Ref } from 'vue'

const props = defineProps<{
  boardName: string
}>()

const toServerSubject = new Subject<unknown>()

const boardName$ = from(computed(() => props.boardName))
const x = boardName$.pipe(
  switchMap(name => {
    const ws = webSocket<unknown>('...')
    const subscriptionToOut = toServerSubject.subscribe(ws)
    return ws.pipe(finalize(() => subscriptionToOut.unsubscribe()))
  }),
)
</script>

<template>
  <slot name="session"></slot>
</template>

<style scoped></style>
