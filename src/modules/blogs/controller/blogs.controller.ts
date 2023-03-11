import { Controller, Get, Query } from '@nestjs/common';
import { BlogsService } from '../service/blogs.service';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../schemas/blogs.schema';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Get('/blogs')
  async findAllBlogsForUsers(
    @Query() paginationDto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsService.getBlogs(paginationDto, false);
  }
}
