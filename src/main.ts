import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createWriteStream } from 'fs';
import { get } from 'http';
import { useContainer } from 'class-validator';

const serverUrl = 'http://localhost:3000';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = parseInt(configService.get<string>('PORT'), 10) || 3000;
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const errorsForResponse = [];
        errors.forEach((e) => {
          const constraintsKeys = Object.keys(e.constraints);
          constraintsKeys.forEach((ckey) => {
            errorsForResponse.push({
              message: e.constraints[ckey],
              field: e.property,
            });
          });
        });
        throw new BadRequestException(errorsForResponse);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Bloggers example')
    .setDescription('The Bloggers API description')
    .setVersion('1.0')
    .addTag('Bloggers')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(PORT, () => {
    console.log(`Server started on ${PORT} port`);
  });

  if (process.env.NODE_ENV === 'development') {
    get(`${serverUrl}/swagger/swagger-ui-bundle.js`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui-bundle.js'));
      console.log(
        `Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`,
      );
    });
    get(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui-init.js'));
      console.log(
        `Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`,
      );
    });
    get(
      `${serverUrl}/swagger/swagger-ui-standalone-preset.js`,
      function (response) {
        response.pipe(
          createWriteStream('swagger-static/swagger-ui-standalone-preset.js'),
        );
        console.log(
          `Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`,
        );
      },
    );

    get(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
      response.pipe(createWriteStream('swagger-static/swagger-ui.css'));
      console.log(
        `Swagger UI css file written to: '/swagger-static/swagger-ui.css'`,
      );
    });
  }
}
bootstrap();
