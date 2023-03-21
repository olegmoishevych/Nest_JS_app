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
import { BlogsService } from './service/blogs.service';
import {
  BannedUserDto,
  BlogPaginationDto,
  PaginationDto,
} from '../helpers/dto/pagination.dto';
import { BlogsDto } from './dto/blogsDto';
import { PaginationViewModel } from '../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from './schemas/blogs.schema';
import { CreatePostDto } from '../posts/dto/createPostDto';
import { PostsViewModal } from '../posts/schemas/posts.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorator/request.decorator';
import { UserModel } from '../users/schemas/users.schema';
import { BanUserForBloggerDto } from './dto/bloggerDto';
import { BlogsUserViewModel } from './schemas/user-banned.schema';
import { CommentsRepository } from '../comments/repository/comments.repository';
import { CommentsForPostsViewModal } from '../comments/schema/comments.schema';
import { BlogsRepository } from './repository/blogs.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './use-cases/createBlog.use-case';

@Controller('blogger')
export class BloggerController {
  constructor(
    public blogsService: BlogsService,
    public blogsRepository: BlogsRepository,
    public commentsRepository: CommentsRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/blogs/comments')
  async getCommentsForAllPosts(
    @Query() pagination: PaginationDto,
    @User() user: UserModel,
  ): Promise<PaginationViewModel<CommentsForPostsViewModal[]>> {
    return this.commentsRepository.getCommentsByUserId(pagination, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/blogs')
  async findBlogs(
    @Query() paginationDto: BlogPaginationDto,
    @User() user: UserModel,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsRepository.getBlogsForOwner(paginationDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/blogs')
  async createBlog(
    @Body() createBlogType: BlogsDto,
    @User() user: UserModel,
  ): Promise<BlogsViewModel> {
    return this.commandBus.execute(new CreateBlogCommand(createBlogType, user));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/blogs/:id')
  @HttpCode(204)
  async deleteBlogById(
    @User() user: UserModel,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.blogsService.deleteBlogById(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/blogs/:id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') id: string,
    @Body() updateBlogType: BlogsDto,
    @User() user: UserModel,
  ): Promise<boolean> {
    return this.blogsService.updateBlogById(id, updateBlogType, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/blogs/:blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() newPostByBlogId: CreatePostDto,
    @User() user: UserModel,
  ): Promise<PostsViewModal> {
    return this.blogsService.createPostByBlogId(
      blogId,
      newPostByBlogId,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async updatePostByBlogsAndPostsId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @User() user: UserModel,
    @Body() updatePost: CreatePostDto,
  ): Promise<boolean> {
    return this.blogsService.updatePostByBlogsAndPostsId(
      postId,
      blogId,
      user.id,
      updatePost,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async deletePostByBlogsAndPostsId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @User() user: UserModel,
  ): Promise<boolean> {
    return this.blogsService.deletePostByBlogsAndPostsId(
      postId,
      blogId,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/users/:id/ban')
  @HttpCode(204)
  async banUserById(
    @Param('id') id: string,
    @Body() banUserModal: BanUserForBloggerDto,
    @User() user: UserModel,
  ): Promise<BlogsUserViewModel> {
    return this.blogsService.banUserById(id, banUserModal, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/blog/:id')
  async getBannedUser(
    @Param('id') id: string,
    @Query() pagination: BannedUserDto,
    @User() user: UserModel,
  ): Promise<PaginationViewModel<BlogsUserViewModel[]>> {
    return this.blogsService.getBannedUsers(id, pagination, user.id);
  }
}
