import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { Blogs, BlogsSchema } from '../blogs/schemas/blogs.schema';
import { BlogsService } from '../blogs/service/blogs.service';
import { BlogsController } from '../blogs/controller/blogs.controller';
import { UsersController } from '../users/controller/users.controller';
import { UsersService } from '../users/service/users.service';
import { UsersRepository } from '../users/repository/users.repository';
import { Users, UsersSchema } from '../users/schemas/users.schema';
import { TestingRepository } from '../testing/repository/testing.repository';
import { TestingService } from '../testing/service/testing.service';
import { TestingController } from '../testing/controller/testing.controller';
import { Posts, PostsSchema } from '../posts/schemas/posts.schema';
import { PostsService } from '../posts/service/posts.service';
import { PostsRepository } from '../posts/repository/posts.repository';
import { PostsController } from '../posts/controller/posts.controller';
import { Comments, CommentsSchema } from '../comments/schema/comments.schema';
import { CommentsService } from '../comments/service/comments.service';
import { CommentsRepository } from '../comments/repository/comments.repository';
import { CommentsController } from '../comments/controller/comments.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthController } from '../auth/controller/auth.controller';
import { AuthService } from '../auth/service/auth.service';
import { AuthRepository } from '../auth/repository/auth.repository';
import { MailerModule } from '@nest-modules/mailer';
import { EmailService } from '../email/email.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

const mongooseModels = [
  { name: Blogs.name, schema: BlogsSchema },
  { name: Posts.name, schema: PostsSchema },
  { name: Users.name, schema: UsersSchema },
  { name: Comments.name, schema: CommentsSchema },
];

const controllers = [
  AppController,
  BlogsController,
  UsersController,
  TestingController,
  PostsController,
  CommentsController,
  AuthController,
];

const services = [
  AppService,
  BlogsService,
  UsersService,
  TestingService,
  PostsService,
  CommentsService,
  AuthService,
  EmailService,
  JwtService,
];

const repositories = [
  BlogsRepository,
  UsersRepository,
  TestingRepository,
  PostsRepository,
  CommentsRepository,
  AuthRepository,
];

const throttlerGuard = {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
};

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 10,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'user2023newTestPerson@gmail.com',
          pass: 'chucmvqgtpkxstks',
        },
      },
    }),
    MongooseModule.forFeature(mongooseModels),
  ],
  controllers,
  providers: [...services, ...repositories, throttlerGuard],
})
export class AppModule {}
