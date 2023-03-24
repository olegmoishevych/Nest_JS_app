import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  BlogPaginationDto,
  PaginationDto,
} from '../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from './schemas/blogs.schema';
import { Token } from '../decorators/token.decorator';
import { PostsViewModal } from '../posts/schemas/posts.schema';
import { CommandBus } from '@nestjs/cqrs';
import { FindBlogByIdCommand } from './use-cases/findBlogById.use-case';
import { BlogsSQLqueryRepository } from './repository/blogs.SQLquery.repository';
import { FindPostsByBlogIdCommand } from './use-cases/findPostsByBlogId.use-case';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsSQLquery: BlogsSQLqueryRepository,
    private command: CommandBus,
  ) {}

  @Get('/')
  async findAllBlogsForUsers(
    @Query() query: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsSQLquery.getBlogsForPublic(query);
  }

  @Get('/:blogId/posts')
  async findPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() dto: PaginationDto,
    @Token() userId: string,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.command.execute(
      new FindPostsByBlogIdCommand(blogId, dto, userId),
    );
  }

  @Get('/:id')
  async findBlogById(@Param('id') id: string): Promise<BlogsViewModel> {
    return this.command.execute(new FindBlogByIdCommand(id));
  }
}
