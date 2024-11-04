import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';

const NODE_ENV = process.env.NODE_ENV ?? "development";
const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(PORT);
  if(NODE_ENV==="development") {
    console.log(`\nNow listening @ port ${PORT}`);
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exitCode = -1;
});
