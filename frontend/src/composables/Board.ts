import type { RawBoardEvent } from '@/types/types'
import { reactive, type Reactive } from 'vue'

export function useBoard(boardName: string) {
  let board: {
    connect: () => void
    disconnect: () => void
    socket: WebSocket | undefined
  } = {
    socket: undefined,
    connect: function connect() {
      if (isOpenWebSocket(this.socket)) {
        throw new Error('Already connected.')
      }
      this.socket = new WebSocket(
        `ws://localhost:3000/api/v1/connect?board=${boardName}`,
      )
      this.socket.addEventListener('message', onMessage)
    },

    disconnect: function disconnect() {
      if (!isOpenWebSocket(this.socket)) {
        throw new Error('Cannot close. Socket not open.')
      }
      this.socket.removeEventListener('message', onMessage)
      this.socket.close(0, 'closed connection')
    },
  }

  function onMessage(event: MessageEvent<any>) {
    // console.log(JSON.parse(event.data))
  }

  return board
}

export function isOpenWebSocket(data: unknown): data is WebSocket {
  if (!(data instanceof WebSocket)) {
    return false
  }
  if (data.readyState !== WebSocket.OPEN) {
    return false
  }
  return true
}
