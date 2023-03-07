import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../service/posts.service';
import { CreatePostDtoWithBlogId, LikeStatusDto } from '../dto/createPostDto';
import { PostsViewModal } from '../schemas/posts.schema';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { CommentsService } from '../../comments/service/comments.service';
import { CommentsViewModal } from '../../comments/schema/comments.schema';
import { CommentsDto } from '../../comments/dto/comments.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../auth/decorator/request.decorator';
import { UserModel } from '../../users/schemas/users.schema';
import { Token } from '../../decorators/token.decorator';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';

@Controller('api')
export class PostsController {
  constructor(
    public commentsService: CommentsService,
    public postsService: PostsService,
  ) {}

  @Get('posts')
  async findPosts(
    @Token() userId: string | null,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsService.findPosts(paginationDto, userId);
  }
  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Post('posts')
  async createPost(
    @Body() createPost: CreatePostDtoWithBlogId,
  ): Promise<PostsViewModal> {
    return this.postsService.createPost(createPost);
  }
  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete('posts/:id')
  @HttpCode(204)
  async deletePostById(@Param('id') id: string): Promise<boolean> {
    return this.postsService.deletePostById(id);
  }
  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('posts/:id')
  @HttpCode(204)
  async updatePostById(
    @Param('id') id: string,
    @Body() updatePost: CreatePostDtoWithBlogId,
  ): Promise<boolean> {
    return this.postsService.updatePostById(id, updatePost);
  }

  @Get('posts/:id')
  async findPostById(
    @Token() userId: string | null,
    @Param('id') id: string,
  ): Promise<PostsViewModal> {
    return this.postsService.findPostById(id, userId);
  }
  @Get('posts/:postId/comments')
  async findCommentsByPostId(
    @Param('postId') postId: string,
    @Token() userId: string | null,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<CommentsViewModal[]>> {
    return this.commentsService.findCommentsByPostId(
      postId,
      paginationDto,
      userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post('posts/:postId/comments')
  async createCommentByPostId(
    @Param('postId') postId: string,
    @Body() commentsDto: CommentsDto,
    @User() user: UserModel,
  ): Promise<CommentsViewModal> {
    return this.postsService.createCommentByPostId(postId, commentsDto, user);
  }
  @UseGuards(JwtAuthGuard)
  @Put('posts/:postId/like-status')
  @HttpCode(204)
  async updateLikeStatusByPostId(
    @User() user,
    @Param('postId') postId: string,
    @Body() likeStatus: LikeStatusDto,
  ): Promise<boolean> {
    return this.postsService.findPostByIdAndUpdateLikeStatus(
      postId,
      likeStatus.likeStatus,
      user,
    );
  }
}
