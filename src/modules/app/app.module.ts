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

const mongooseModels = [
  { name: Blogs.name, schema: BlogsSchema },
  { name: Users.name, schema: UsersSchema },
];

const controllers = [
  AppController,
  BlogsController,
  UsersController,
  TestingController,
];

const services = [AppService, BlogsService, UsersService, TestingService];

const repositories = [BlogsRepository, UsersRepository, TestingRepository];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(mongooseModels),
  ],
  controllers,
  providers: [...services, ...repositories],
})
export class AppModule {}
