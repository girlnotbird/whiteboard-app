import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BoardService } from './boards/board.service';

@WebSocketGateway({ path: '/api/v1/connect' })
export class BoardSessionGateway implements OnGatewayConnection {
  public constructor(private readonly boardService: BoardService) {
    Logger.log('BoardSessionGateway created');
  }

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const url = new URL(`http://localhost${req.url}`);
    const board = url.searchParams.get('board');
    if (!board) {
      throw new HttpException('bad request', HttpStatus.BAD_REQUEST);
    }

    const session = this.boardService.getBoardSession(board);
    session.addMember(client);
  }
}
