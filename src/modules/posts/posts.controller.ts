import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './service/posts.service';
import { LikeStatusDto } from './dto/createPostDto';
import { PostsViewModal } from './schemas/posts.schema';
import { PaginationViewModel } from '../helpers/pagination/pagination-view-model';
import { PaginationDto } from '../helpers/dto/pagination.dto';
import { CommentsService } from '../comments/service/comments.service';
import { CommentsViewModal } from '../comments/schema/comments.schema';
import { CommentsDto } from '../comments/dto/comments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorator/request.decorator';
import { Token } from '../decorators/token.decorator';
import { PostsRepository } from './repository/posts.repository';
import { UserEntity } from '../auth/domain/entities/user.entity';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentForPostCommand } from '../comments/use-cases/createCommentForPost.use-case';
import { CreateLikeForPostCommand } from './use-cases/createLikeForPost.use-case';
import { PostsQuerySqlRepository } from './repository/postsQuerySql.repository';
import { FindPostByIdCommand } from './use-cases/findPostById.use-case';
import { LikesEntity } from './domain/entities/likes.entity';
import { FindCommentsByPostIdCommand } from './use-cases/findCommentsByPostId.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    public commentsService: CommentsService,
    public postsService: PostsService,
    public postsRepository: PostsRepository,
    public postsQueryRepo: PostsQuerySqlRepository,
    public command: CommandBus,
  ) {}

  @Get('/')
  async findPosts(
    @Token() userId: string,
    @Query() dto: PaginationDto,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsQueryRepo.findPosts(userId, dto);
  }

  // @UseGuards(BasicAuthGuard)
  // @Put('/:id')
  // @HttpCode(204)
  // async updatePostById(
  //   @Param('id') id: string,
  //   @Body() updatePost: CreatePostDtoWithBlogId,
  //   @User() user: UserEntity,
  // ): Promise<boolean> {
  //   return this.command.execute(
  //     new UpdatePostByIdCommand(id, updatePost, user),
  //   );
  // return this.postsService.updatePostById(id, updatePost, user.id);
  // }

  @Get('/:id')
  async findPostById(@Token() userId: string | null, @Param('id') id: string) {
    return this.command.execute(new FindPostByIdCommand(userId, id));
  }

  @Get('/:postId/comments')
  async findCommentsByPostId(
    @Param('postId') postId: string,
    @Token() userId: string | null,
    @Query() dto: PaginationDto,
  ): Promise<PaginationViewModel<CommentsViewModal[]>> {
    return this.command.execute(
      new FindCommentsByPostIdCommand(postId, userId, dto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:postId/comments')
  async createCommentByPostId(
    @Param('postId') postId: string,
    @Body() commentsDto: CommentsDto,
    @User() user: UserEntity,
  ): Promise<CommentsViewModal> {
    return this.command.execute(
      new CreateCommentForPostCommand(postId, commentsDto, user),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:postId/like-status')
  @HttpCode(204)
  async updateLikeStatusByPostId(
    @User() user: UserEntity,
    @Param('postId') postId: string,
    @Body() dto: LikeStatusDto,
  ): Promise<LikesEntity> {
    return this.command.execute(
      new CreateLikeForPostCommand(user, postId, dto),
    );
  }
}
