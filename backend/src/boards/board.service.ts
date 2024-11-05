import { Injectable, Logger, Scope } from '@nestjs/common';
import { BoardSession } from './board.session';

@Injectable({ scope: Scope.DEFAULT })
export class BoardService {
  private readonly gcInterval: ReturnType<typeof setInterval>;

  private readonly sessions = new Map<string, BoardSession>();

  constructor() {
    Logger.log('BoardService created');

    this.gcInterval = setInterval(() => {
      this.cleanUpInactiveSessions();
    }, 10000);
  }

  public getBoardSession(boardId: string): BoardSession {
    let session = this.sessions.get(boardId);
    if (session == null) {
      session = new BoardSession(boardId);
      this.sessions.set(boardId, session);
    }
    return session;
  }

  private cleanUpInactiveSessions(): void {
    const sessions = Array.from(this.sessions.entries());
    for (const [id, session] of sessions) {
      if (session.memberCount() == 0) {
        session.shutdown();
        this.sessions.delete(id);
        Logger.log(`cleaning up inactive session for board ${id}`);
      }
    }
  }
}
