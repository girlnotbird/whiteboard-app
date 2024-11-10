import { onMounted, onUnmounted } from 'vue'


export function useBoard(
  boardName: string,
  onMessage: (messageEvent: MessageEvent) => void,
) {
  const board: {
    connect: () => void
    disconnect: () => void
    socket: WebSocket | undefined
  } = {
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

  onMounted(() => {
    board.connect()
    board.socket?.addEventListener('message', onMessage)
  })

  onUnmounted(() => {
    board.disconnect()
  })

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
