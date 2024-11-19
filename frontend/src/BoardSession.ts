import { Subject } from 'rxjs'

import {
  type IBoardEvent,
  zBoardEvent,
} from '@liveboard/common/src/board-events'

export class BoardSession {
  private readonly notClosedStates = [WebSocket.CONNECTING, WebSocket.OPEN]
  private readonly fromServerSubject = new Subject<IBoardEvent>()
  private socket: WebSocket | null = null
  private connAbortController: AbortController | null = null

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
      this.connAbortController?.abort() // removes event listeners from socket
      this.socket?.close()
    } finally {
      this.socket = null
      this.connAbortController = null
    }
  }

  private attachToWebSocket(socket: WebSocket) {
    this.socket = socket
    this.connAbortController = new AbortController()
    // The .bind is necessary because in the context of socket.addEventListener, without .bind, this is socket, not the session instance
    this.socket.addEventListener(
      'message',
      this.onWebSocketMessage.bind(this),
      { signal: this.connAbortController.signal },
    )
    this.socket.addEventListener('error', this.onWebSocketError.bind(this), {
      signal: this.connAbortController.signal,
    })
    this.socket.addEventListener('close', this.onWebSocketClose.bind(this), {
      signal: this.connAbortController.signal,
    })
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
