<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import {
  type IBoardElementDeleteEvent,
  type IBoardElementUpsertEvent,
  type IBoardEvent,
  type IBoardSnapshotEvent,
  type IRawBoardEvent,
  zBoardElementDeleteEvent,
  zBoardElementUpsertEvent,
  zBoardEvent,
  zBoardSnapshotEvent,
} from '@liveboard/common/src/board-events'
import { BoardSession } from './BoardSession'
import type { Observer, Subscription } from 'rxjs'
import type { IBoardElement } from '@liveboard/common/src/board-elements'
import type { MouseEventWithPosAndBtn } from './BoardView.vue'
import { nanoid } from 'nanoid'
import BoardView from './BoardView.vue'

const defaultHandlers = {
  next: handleStreamEvent,
  error: (err: any) => {
    session.endCurrentSession(err)
  },
  complete: () => {
    session.endCurrentSession()
  },
}

let activeHandlers: Observer<IRawBoardEvent>
let activeSubscription: Subscription

const props = defineProps<{
  boardName: string
}>()

const session = new BoardSession()

const socket = computed(() => {
  return new WebSocket(
    `ws://localhost:3000/api/v1/connect?board=${props.boardName}`,
  )
})

const boardElements = reactive<IBoardElement[]>([])

function handleStreamEvent(event: IRawBoardEvent) {
  try {
    const parsedEvent: IBoardEvent = zBoardEvent.parse(event)
    switch (parsedEvent.type) {
      case 'board-element-delete': {
        const deleteEvent: IBoardElementDeleteEvent =
          zBoardElementDeleteEvent.parse(parsedEvent)
        onDelete(deleteEvent.data)
        break
      }
      case 'board-element-upsert': {
        const upsertEvent: IBoardElementUpsertEvent =
          zBoardElementUpsertEvent.parse(parsedEvent)
        onUpsert(upsertEvent.data)
        break
      }
      case 'board-snapshot': {
        const snapshotEvent: IBoardSnapshotEvent =
          zBoardSnapshotEvent.parse(parsedEvent)
        onSnapshot(snapshotEvent.data)
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
    const matchingElements = boardElements.filter(elem => {
      return elem.id === data.id
    })
    if (matchingElements.length === 0) {
      throw new Error('element not found')
    }
    if (matchingElements.length > 1) {
      throw new Error('more than one element with given ID')
    }
    const elem = matchingElements[0]
    const index = boardElements.indexOf(elem)
    boardElements.splice(index, 1)
  } catch (err) {
    console.error(err)
    return
  }
}

function onUpsert(data: IBoardElementUpsertEvent['data']) {
  try {
    const index = boardElements.findIndex(elem => {
      return elem.id === data.id
    })
    if (index !== -1) {
      boardElements[index] = data
    } else {
      boardElements.push(data)
    }
  } catch (err) {
    console.error(err)
    return
  }
}

function onSnapshot(data: IBoardSnapshotEvent['data']) {
  boardElements.splice(0, boardElements.length)
  boardElements.push(...data)
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

onMounted(() => {
  session.setWebSocket(socket.value)
  activeHandlers = defaultHandlers
  activeSubscription = session.getEventStream().subscribe(activeHandlers)
})

onUnmounted(() => {
  activeSubscription.unsubscribe()
})
</script>

<template>
  <BoardView
    ref="boardView"
    :elements="boardElements"
    @boardMouseDown="onMouseDown"
  />
</template>

<style scoped></style>
