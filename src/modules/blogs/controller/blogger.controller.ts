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
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { BlogsDto } from '../dto/blogsDto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../schemas/blogs.schema';
import { CreatePostDto } from '../../posts/dto/createPostDto';
import { PostsViewModal } from '../../posts/schemas/posts.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../auth/decorator/request.decorator';
import { UserModel } from '../../users/schemas/users.schema';

@Controller('blogger')
export class BloggerController {
  constructor(public blogsService: BlogsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/blogs')
  async findBlogs(
    @Query() paginationDto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsService.getBlogs(paginationDto, false);
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
}
