import { Subject } from 'rxjs'

import {
  type IBoardEvent,
  type IRawBoardEvent,
  zBoardEvent,
} from '@liveboard/common/src/board-events'

export class BoardSession {
  private readonly notClosedStates = [WebSocket.CONNECTING, WebSocket.OPEN]
  private readonly fromServerSubject = new Subject<IRawBoardEvent>()
  private socket: WebSocket | null = null

  public constructor() {}

  public setWebSocket(socket: WebSocket) {
    this.detachFromWebSocket()
    this.attachToWebSocket(socket)
  }

  public get isOpen(): boolean {
    return this.notClosedStates.includes(this.socket?.readyState as any)
  }

  public publishEvent(evt: IBoardEvent) {
    if (!this.isOpen) {
      // TODO: should we... do something else?
      throw new Error('no connection')
    }

    this.socket!.send(JSON.stringify(evt))
  }

  private detachFromWebSocket() {
    try {
      this.socket?.removeEventListener('message', this.onWebSocketMessage)
      this.socket?.removeEventListener('error', this.onWebSocketError)
      this.socket?.removeEventListener('close', this.onWebSocketClose)
      this.socket?.close()
    } finally {
      this.socket = null
    }
  }

  private attachToWebSocket(socket: WebSocket) {
    this.socket = socket
    this.socket.addEventListener('message', this.onWebSocketMessage)
    this.socket.addEventListener('error', this.onWebSocketError)
    this.socket.addEventListener('close', this.onWebSocketClose)
  }

  private onWebSocketMessage(evt: WebSocketEventMap['message']) {
    try {
      const parsedData = this.parseBoardEventFromStream(evt.data)
      this.fromServerSubject.next(parsedData)
    } catch (err) {
      console.error(err)
    }
  }

  private onWebSocketError(evt: WebSocketEventMap['error']) {
    console.error(evt)
    this.detachFromWebSocket()
  }

  private onWebSocketClose(_evt: WebSocketEventMap['close']): void {
    this.detachFromWebSocket()
  }

  private parseBoardEventFromStream(
    maybeAStringOrBufferOrSomething: any,
  ): IBoardEvent {
    // TODO: you know, don't just assume its a string
    const asObject = JSON.parse(maybeAStringOrBufferOrSomething)
    return zBoardEvent.parse(asObject)
  }
}
