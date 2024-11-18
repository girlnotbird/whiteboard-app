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

  public endCurrentSession(err?: any) {
    if (err) {
      console.error('unexpected error, ending session. Error: ')
      console.error(err)
    }
    this.detachFromWebSocket()
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

  public getEventStream() {
    return this.fromServerSubject
  }

  private detachFromWebSocket() {
    try {
      this.socket?.removeEventListener(
        'message',
        this.onWebSocketMessage.bind(this),
      )
      this.socket?.removeEventListener(
        'error',
        this.onWebSocketError.bind(this),
      )
      this.socket?.removeEventListener(
        'close',
        this.onWebSocketClose.bind(this),
      )
      this.socket?.close()
    } finally {
      this.socket = null
    }
  }

  private attachToWebSocket(socket: WebSocket) {
    this.socket = socket
    // The .bind is necessary because in the context of socket.addEventListener, without .bind, this is socket, not the session instance
    this.socket.addEventListener('message', this.onWebSocketMessage.bind(this))
    this.socket.addEventListener('error', this.onWebSocketError.bind(this))
    this.socket.addEventListener('close', this.onWebSocketClose.bind(this))
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
