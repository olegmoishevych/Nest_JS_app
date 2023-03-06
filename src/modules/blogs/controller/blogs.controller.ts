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
import { CreatePostDto } from '../../posts/dto/createPostDto';
import { PostsViewModal } from '../../posts/schemas/posts.schema';
import { PostsService } from '../../posts/service/posts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Token } from '../../decorators/token.decorator';

@Controller('api')
export class BlogsController {
  constructor(
    public blogsService: BlogsService,
    public postsService: PostsService,
  ) {}

  @Get('blogs')
  async findBlogs(
    @Query() paginationDto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsService.getBlogs(paginationDto);
  }
  @UseGuards(JwtAuthGuard)
  @Post('blogs')
  async createBlog(@Body() createBlogType: BlogsDto) {
    return this.blogsService.createBlog(createBlogType);
  }
  @UseGuards(JwtAuthGuard)
  @Delete('blogs/:id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string): Promise<boolean> {
    return this.blogsService.deleteBlogById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Put('blogs/:id')
  @HttpCode(204)
  async updateBlogById(
    @Param('id') id: string,
    @Body() updateBlogType: BlogsDto,
  ): Promise<boolean> {
    return this.blogsService.updateBlogById(id, updateBlogType);
  }

  @Get('blogs/:id')
  async findBlogById(@Param('id') id: string): Promise<BlogsViewModel> {
    return this.blogsService.findBlogById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post('blogs/:blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() newPostByBlogId: CreatePostDto,
  ): Promise<PostsViewModal> {
    return this.blogsService.createPostByBlogId(blogId, newPostByBlogId);
  }
  @Get('blogs/:blogId/posts')
  async findPostByBlogId(
    @Param('blogId') blogId: string,
    @Query() paginationDto: PaginationDto,
    @Token() userId: string,
  ): Promise<PaginationViewModel<PostsViewModal>> {
    return this.postsService.findPostByBlogId(blogId, paginationDto, userId);
  }
}
