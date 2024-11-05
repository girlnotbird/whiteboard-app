import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardService } from './boards/board.service';
import { BoardSessionGateway } from './app.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BoardService, BoardSessionGateway],
})
export class AppModule {}
