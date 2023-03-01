import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BlogsService } from '../service/blogs.service';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { BlogsDto } from '../dto/blogsDto';

@Controller('api')
export class BlogsController {
  constructor(public blogsService: BlogsService) {}

  @Get('blogs')
  async findBlogs(@Query() paginationType: PaginationDto) {
    // console.log('paginationType', paginationType);
    return this.blogsService.getBlogs(paginationType);
  }
  @Post('blogs')
  async createBlog(@Body() createBlogType: BlogsDto) {
    return this.blogsService.createBlog(createBlogType);
  }
}
