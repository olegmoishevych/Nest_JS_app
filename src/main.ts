import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = parseInt(configService.get<string>('PORT'), 10) || 3000;

  app.enableCors();
  app.use(cookieParser());

  await app.listen(PORT, () => {
    console.log(`Server started on ${PORT} port`);
  });
}

bootstrap();
