import { WebSocket } from 'ws';
import { Logger } from '@nestjs/common';

export class BoardSession {
  private ENABLE_TX_TO_SELF: boolean = true;
  private readonly members = new Map<number, WebSocket>();
  private nextMemberId = 0;

  public constructor(private readonly boardId: string) {}

  public addMember(socket: WebSocket): void {
    const id = this.nextMemberId++;
    this.startDrivingMember(id, socket);
    Logger.log(`member ${id} joined session for board ${this.boardId}`);
  }

  public memberCount(): number {
    return this.members.size;
  }

  public shutdown() {
    for (const member of this.members.values()) {
      member.close();
    }
    this.members.clear();
  }

  private startDrivingMember(id: number, socket: WebSocket) {
    this.members.set(id, socket);

    socket.addEventListener(
      'message',
      ((event) => {
        for (const [otherId, otherSocket] of this.members.entries()) {
          if (!this.ENABLE_TX_TO_SELF && otherId == id) {
            continue;
          }

          otherSocket.send(event.data);
        }
      }).bind(this),
    );

    socket.addEventListener('close', () => {
      this.members.delete(id);
      Logger.log(`member ${id} left session for board ${this.boardId}`);
    });

    socket.addEventListener('error', (event) => {
      Logger.error(event.error);
      socket.close();
    });
  }
}
