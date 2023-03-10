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
import { BlogsService } from '../service/blogs.service';
import {
  BlogPaginationDto,
  PaginationDto,
} from '../../helpers/dto/pagination.dto';
import { BlogsDto } from '../dto/blogsDto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../schemas/blogs.schema';
import {
  CreatePostDto,
  CreatePostDtoWithBlogId,
} from '../../posts/dto/createPostDto';
import { PostsViewModal } from '../../posts/schemas/posts.schema';
import { PostsService } from '../../posts/service/posts.service';
import { Token } from '../../decorators/token.decorator';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../auth/decorator/request.decorator';
import { UserModel } from '../../users/schemas/users.schema';

@Controller('blogger')
export class BloggerController {
  constructor(
    public blogsService: BlogsService,
    public postsService: PostsService,
  ) {}

  @UseGuards(JwtAuthGuard) // 1
  @Get('/blogs')
  async findBlogs(
    @Query() paginationDto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsService.getBlogs(paginationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/blogs') // 2
  async createBlog(@Body() createBlogType: BlogsDto, @User() user: UserModel) {
    return this.blogsService.createBlog(createBlogType, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/blogs/:id') // 3
  @HttpCode(204)
  async deleteBlogById(
    @User() user: UserModel,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.blogsService.deleteBlogById(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/blogs/:id') // 4
  @HttpCode(204)
  async updateBlogById(
    @Param('id') id: string,
    @Body() updateBlogType: BlogsDto,
  ): Promise<boolean> {
    return this.blogsService.updateBlogById(id, updateBlogType);
  }

  @Get('/blogs/:id')
  async findBlogById(@Param('id') id: string): Promise<BlogsViewModel> {
    return this.blogsService.findBlogById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/blogs/:blogId/posts') // 5
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() newPostByBlogId: CreatePostDto,
  ): Promise<PostsViewModal> {
    return this.blogsService.createPostByBlogId(blogId, newPostByBlogId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async updatePostByBlogsAndPostsId(
    @Param() blogId: string,
    postId: string,
    @Body() updatePost: CreatePostDtoWithBlogId,
  ) {}

  @Get('/blogs/:blogId/posts')
  async findPostByBlogId(
    @Param('blogId') blogId: string,
    @Query() paginationDto: PaginationDto,
    @Token() userId: string,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsService.findPostByBlogId(blogId, paginationDto, userId);
  }
}
