import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlogsRepository } from './blogs/repository/blogs.repository';
import { BlogsService } from './blogs/service/blogs.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/service/users.service';
import { UsersRepository } from './users/repository/users.repository';
import { TestingRepository } from './testing/repository/testing.repository';
import { TestingController } from './testing/controller/testing.controller';
import { PostsService } from './posts/service/posts.service';
import { PostsRepository } from './posts/repository/posts.repository';
import { PostsController } from './posts/posts.controller';
import { CommentsService } from './comments/service/comments.service';
import { CommentsRepository } from './comments/repository/comments.repository';
import { CommentsController } from './comments/comments.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/service/auth.service';
import { AuthRepository } from './auth/repository/auth.repository';
import { MailerModule } from '@nest-modules/mailer';
import { EmailService } from './email/email.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT } from './auth/constants';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './auth/strategies/basic-auth.strategy';
import { LikeStatusRepository } from './posts/repository/likeStatus.repository';
import { BlogIsExistRule } from './blogs/validators/customValidateBlog';
import { DevicesRepository } from './devices/repository/devices.repository';
import { DevicesService } from './devices/service/devices.service';
import { DevicesController } from './devices/devices.controller';
import { BloggerController } from './blogs/blogger.controller';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { BlogsController } from './blogs/blogs.controller';
import { UserBannedRepository } from './blogs/repository/user-banned.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationUseCase } from './auth/use-cases/registration.use-case';
import { CreateUserUseCase } from './users/use-cases/create-user.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import process from 'process';
import { UserEntity } from './auth/domain/entities/user.entity';
import { BanInfoEntity } from './auth/domain/entities/ban-info.entity';
import { EmailConfirmationEntity } from './auth/domain/entities/email.Confirmation.entity';
import { UsersSqlRepository } from './users/repository/users.sql.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blogs, BlogsSchema } from './blogs/schemas/blogs.schema';
import { Posts, PostsSchema } from './posts/schemas/posts.schema';
import { Users, UsersSchema } from './users/schemas/users.schema';
import { Comments, CommentsSchema } from './comments/schema/comments.schema';
import {
  RecoveryCode,
  RecoveryCodeSchema,
} from './auth/schemas/recoveryCode.schemas';
import {
  LikeStatus,
  LikeStatusSchema,
} from './comments/schema/likeStatus.schema';
import { Devices, DevicesSchema } from './devices/schemas/devices.schemas';
import {
  UserBanned,
  UserBannedSchema,
} from './blogs/schemas/user-banned.schema';
import { EmailRepository } from './email/email.repository';
import { ConfirmationUseCase } from './auth/use-cases/confirmation-use-case';
import { EmailResendingUseCase } from './auth/use-cases/registration-email-resending.use-case';
import { LoginUseCase } from './auth/use-cases/login.use-case';
import { LogoutUseCase } from './auth/use-cases/logout.user-case';
import { RefreshTokenUseCase } from './auth/use-cases/refreshToken.use-case';
import { PasswordRecoveryUseCase } from './auth/use-cases/password-recovery.use-case';
import { PasswordRecoveryEntity } from './auth/domain/entities/passwordRecoveryEntity';
import { NewPasswordUseCase } from './auth/use-cases/new-password.use-case';
import { DeleteUserUseCase } from './users/use-cases/delete-user.use-case';
import { TestingSqlRepository } from './testing/repository/testing.sql.repository';
import { BlogsEntity } from './blogs/domain/entities/blogs.entity';
import { BlogsSqlRepository } from './blogs/repository/blogs.sql.repository';
import { CreateBlogUseCase } from './blogs/use-cases/createBlog.use-case';
import { DeleteBlogUseCase } from './blogs/use-cases/deleteBlog.use-case';
import { BlogsSQLqueryRepository } from './blogs/repository/blogs.SQLquery.repository';
import { FindBlogByIdUseCase } from './blogs/use-cases/findBlogById.use-case';
import { UpdateBlogByIdUseCase } from './blogs/use-cases/updateBlogById.use-case';
import { PostsEntity } from './posts/domain/entities/posts.entity';
import { LikesEntity } from './posts/domain/entities/likes.entity';
import { PostsSQLRepository } from './posts/repository/postsSQL.repository';
import { CreatePostByBlogIdUseCase } from './blogs/use-cases/createPostByBlogId.use-case';
import { UpdatePostByBlogsAndPostsIdUseCase } from './blogs/use-cases/updatePostByBlogsAndPostsId.use-case';
import { DeletePostByBlogsAndPostsIdUseCase } from './blogs/use-cases/deletePostByBlogsAndPostsId.use-case';
import { BanUserByIdUseCase } from './blogs/use-cases/banUserById.use-case';
import { UserBannedEntity } from './blogs/domain/entities/user-banned.entity';
import { UserBannedSQLRepository } from './blogs/repository/user-banned.SQL.repository';
import { DevicesEntity } from './devices/domain/entities/devices.entity';
import { GetAlldevicesUseCase } from './devices/use-cases/getAlldevices.use-case';
import { DevicesSQLRepository } from './devices/repository/devicesSQL.repository';
import { DeleteAlldevicesUseCase } from './devices/use-cases/deleteAlldevies.use-case';
import { DeleteAllDevicesByDeviceIdUseCase } from './devices/use-cases/deleteAllDevicesByDeviceId.use-case';
import { CommentsEntity } from './comments/domain/comments.entity';
import { CommentatorInfoEntity } from './comments/domain/commentatorInfo.entity';
import { CommentsSQLRepository } from './comments/repository/commentsSQL.repository';
import { CreateCommentForPostUseCase } from './comments/use-cases/createCommentForPost.use-case';
import { CreateLikeForPostUseCase } from './posts/use-cases/createLikeForPost.use-case';
import { LikeStatusSQLRepository } from './posts/repository/likeStatusSQL.repository';
import { PostsQuerySqlRepository } from './posts/repository/postsQuerySql.repository';
import { FindPostByIdUseCase } from './posts/use-cases/findPostById.use-case';
import { FindCommentByIdUseCase } from './comments/use-cases/findCommentById.use-case';
import { CommentsSQLqueryRepository } from './comments/repository/commentsSQLquery.repository';
import { CreateLikeForCommentUseCase } from './comments/use-cases/createLikeForCommentUseCase';

const mongooseModels = [
  { name: Blogs.name, schema: BlogsSchema },
  { name: Posts.name, schema: PostsSchema },
  { name: Users.name, schema: UsersSchema },
  { name: Comments.name, schema: CommentsSchema },
  { name: RecoveryCode.name, schema: RecoveryCodeSchema },
  { name: LikeStatus.name, schema: LikeStatusSchema },
  { name: Devices.name, schema: DevicesSchema },
  { name: UserBanned.name, schema: UserBannedSchema },
];

const controllers = [
  BloggerController,
  UsersController,
  TestingController,
  PostsController,
  CommentsController,
  AuthController,
  DevicesController,
  BlogsController,
];

const useCases = [
  RegistrationUseCase,
  CreateUserUseCase,
  ConfirmationUseCase,
  EmailResendingUseCase,
  LoginUseCase,
  LogoutUseCase,
  RefreshTokenUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  DeleteUserUseCase,
  CreateBlogUseCase,
  DeleteBlogUseCase,
  FindBlogByIdUseCase,
  UpdateBlogByIdUseCase,
  CreatePostByBlogIdUseCase,
  UpdatePostByBlogsAndPostsIdUseCase,
  DeletePostByBlogsAndPostsIdUseCase,
  BanUserByIdUseCase,
  GetAlldevicesUseCase,
  DeleteAlldevicesUseCase,
  DeleteAllDevicesByDeviceIdUseCase,
  CreateCommentForPostUseCase,
  CreateLikeForPostUseCase,
  FindPostByIdUseCase,
  FindCommentByIdUseCase,
  CreateLikeForCommentUseCase,
];

const services = [
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
  UsersSqlRepository,
  EmailRepository,
  TestingSqlRepository,
  BlogsSqlRepository,
  BlogsSQLqueryRepository,
  PostsSQLRepository,
  UserBannedSQLRepository,
  PostsSQLRepository,
  DevicesSQLRepository,
  CommentsSQLRepository,
  LikeStatusSQLRepository,
  PostsQuerySqlRepository,
  CommentsSQLqueryRepository,
];

const entities = [
  UserEntity,
  BanInfoEntity,
  EmailConfirmationEntity,
  PasswordRecoveryEntity,
  BlogsEntity,
  BanInfoEntity,
  PostsEntity,
  LikesEntity,
  UserBannedEntity,
  DevicesEntity,
  CommentsEntity,
  CommentatorInfoEntity,
];

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
    TypeOrmModule.forFeature([...entities]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
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
