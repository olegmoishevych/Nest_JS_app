import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { runDb } from '../db/db';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(cookieParser());
  app.enableCors();

  try {
    await runDb();
    await app.listen(PORT, () => {
      console.log(`Server started on ${PORT} port`);
    });
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
