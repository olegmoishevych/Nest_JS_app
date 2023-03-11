import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsService } from '../service/blogs.service';
import {
  BlogPaginationDto,
  PaginationDto,
} from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../schemas/blogs.schema';
import { Token } from '../../decorators/token.decorator';
import { PostsViewModal } from '../../posts/schemas/posts.schema';
import { PostsService } from '../../posts/service/posts.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
  ) {}

  @Get('/')
  async findAllBlogsForUsers(
    @Query() paginationDto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsService.getBlogs(paginationDto, false);
  }
  @Get('/:blogId/posts')
  async findPostByBlogId(
    @Param('blogId') blogId: string,
    @Query() paginationDto: PaginationDto,
    @Token() userId: string,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsService.findPostByBlogId(blogId, paginationDto, userId);
  }
}
