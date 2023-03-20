import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BlogsRepository } from '../blogs/repository/blogs.repository';
import { BlogsService } from '../blogs/service/blogs.service';
import { UsersController } from '../users/controller/users.controller';
import { UsersService } from '../users/service/users.service';
import { UsersRepository } from '../users/repository/users.repository';
import { TestingRepository } from '../testing/repository/testing.repository';
import { TestingController } from '../testing/controller/testing.controller';
import { PostsService } from '../posts/service/posts.service';
import { PostsRepository } from '../posts/repository/posts.repository';
import { PostsController } from '../posts/controller/posts.controller';
import { CommentsService } from '../comments/service/comments.service';
import { CommentsRepository } from '../comments/repository/comments.repository';
import { CommentsController } from '../comments/controller/comments.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/service/auth.service';
import { AuthRepository } from '../auth/repository/auth.repository';
import { MailerModule } from '@nest-modules/mailer';
import { EmailService } from '../email/email.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT } from '../auth/constants';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from '../auth/strategies/basic-auth.strategy';
import { LikeStatusRepository } from '../posts/repository/likeStatus.repository';
import { BlogIsExistRule } from '../blogs/validators/customValidateBlog';
import { DevicesRepository } from '../devices/repository/devices.repository';
import { DevicesService } from '../devices/service/devices.service';
import { DevicesController } from '../devices/controller/devices.controller';
import { BloggerController } from '../blogs/controller/blogger.controller';
import { LocalStrategy } from '../auth/strategies/local.strategy';
import { BlogsController } from '../blogs/controller/blogs.controller';
import { UserBannedRepository } from '../blogs/repository/user-banned.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUseCase } from '../auth/use-cases/registration.use-case';
import { CreateUserUseCase } from '../users/use-cases/create-user.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import process from 'process';
import { UserEntity } from '../auth/domain/entities/user.entity';
import { BanInfoEntity } from '../auth/domain/entities/ban-info.entity';
import { EmailConfirmationEntity } from '../auth/domain/entities/email.Confirmation.entity';

// const mongooseModels = [
//   { name: Blogs.name, schema: BlogsSchema },
//   { name: Posts.name, schema: PostsSchema },
//   { name: Users.name, schema: UsersSchema },
//   { name: Comments.name, schema: CommentsSchema },
//   { name: RecoveryCode.name, schema: RecoveryCodeSchema },
//   { name: LikeStatus.name, schema: LikeStatusSchema },
//   { name: Devices.name, schema: DevicesSchema },
//   { name: UserBanned.name, schema: UserBannedSchema },
// ];

const controllers = [
  AppController,
  BloggerController,
  UsersController,
  TestingController,
  PostsController,
  CommentsController,
  AuthController,
  DevicesController,
  BlogsController,
];

const useCases = [RegistrationUseCase, CreateUserUseCase];

const services = [
  AppService,
  BlogsService,
  UsersService,
  PostsService,
  CommentsService,
  AuthService,
  EmailService,
  JwtService,
  DevicesService,
];

const repositories = [
  BlogsRepository,
  UsersRepository,
  TestingRepository,
  PostsRepository,
  CommentsRepository,
  AuthRepository,
  LikeStatusRepository,
  DevicesRepository,
  UserBannedRepository,
];

const entities = [UserEntity, BanInfoEntity, EmailConfirmationEntity];

const throttlerGuard = {
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
};

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 10,
    }),
    JwtModule.register({
      secret: JWT.jwt_secret,
      signOptions: { expiresIn: '600s' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGO_URL'),
    //   }),
    //   inject: [ConfigService],
    // }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'user2023newTestPerson@gmail.com',
          pass: 'chucmvqgtpkxstks',
        },
      },
    }),
    // MongooseModule.forFeature(mongooseModels),
    TypeOrmModule.forFeature([...entities]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.PORT),
      username: 'postgres',
      password: 'sa',
      database: 'Bloggers',
      synchronize: true,
      autoLoadEntities: true,
    }),
  ],
  controllers,
  providers: [
    ...useCases,
    ...services,
    ...repositories,
    // throttlerGuard,
    JwtStrategy,
    LocalStrategy,
    BasicStrategy,
    BlogIsExistRule,
  ],
})
export class AppModule {}
