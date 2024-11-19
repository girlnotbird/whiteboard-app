<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useSubscription } from '@vueuse/rxjs'
import {
  type IBoardElementDeleteEvent,
  type IBoardElementUpsertEvent,
  type IBoardEvent,
  type IBoardSnapshotEvent,
} from '@liveboard/common/src/board-events'
import { BoardSession } from './BoardSession'
import type { IBoardElement } from '@liveboard/common/src/board-elements'
import type { MouseEventWithPosAndBtn } from './BoardView.vue'
import { nanoid } from 'nanoid'
import BoardView from './BoardView.vue'

const props = defineProps<{
  boardName: string
}>()

const session = new BoardSession()
const boardElements = reactive<Map<string, IBoardElement>>(new Map())

watch(props, newProps => {
  const socket = new WebSocket(
    `ws://localhost:3000/api/v1/connect?board=${newProps.boardName}`,
  )
  session.setWebSocket(socket)
}, {immediate: true})

useSubscription(
  session.getEventStream().subscribe({
    next: handleStreamEvent,
    error: (err: any) => {
      session.endCurrentSession(err)
    },
    complete: () => {
      session.endCurrentSession()
    },
  }),
)

function handleStreamEvent(event: IBoardEvent) {
  try {
    switch (event.type) {
      case 'board-element-delete': {
        onDelete(event.data)
        break
      }
      case 'board-element-upsert': {
        onUpsert(event.data)
        break
      }
      case 'board-snapshot': {
        onSnapshot(event.data)
        break
      }
    }
  } catch (err) {
    // TODO: Handle incoming errors?
    console.error(err)
    return
  }
}

function onDelete(data: IBoardElementDeleteEvent['data']) {
  try {
    boardElements.delete(data.id)
  } catch (err) {
    console.error(err)
    return
  }
}

function onUpsert(data: IBoardElementUpsertEvent['data']) {
  try {
    boardElements.set(data.id, data)
  } catch (err) {
    console.error(err)
    return
  }
}

function onSnapshot(data: IBoardSnapshotEvent['data']) {
  boardElements.clear()
  data.forEach(element => {
    boardElements.set(element.id, element)
  })
}

function onMouseDown(evt: MouseEventWithPosAndBtn) {
  switch (evt.button) {
    case 0: {
      const event: IBoardElementUpsertEvent = {
        type: 'board-element-upsert',
        data: {
          id: nanoid(),
          kind: 'circle',
          cx: evt.x,
          cy: evt.y,
          radius: 5,
        },
      }
      session.publishEvent(event)
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

<template>
  <BoardView
    ref="boardView"
    :elements="boardElements"
    @boardMouseDown="onMouseDown"
  />
</template>

<style scoped></style>
