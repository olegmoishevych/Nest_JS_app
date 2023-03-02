import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BlogsService } from '../service/blogs.service';
import {
  BlogPaginationDto,
  PaginationDto,
} from '../../helpers/dto/pagination.dto';
import { BlogsDto } from '../dto/blogsDto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../schemas/blogs.schema';

@Controller('api')
export class BlogsController {
  constructor(
    public blogsService: BlogsService, // public pagination: getPagination,
  ) {}

  @Get('blogs')
  async findBlogs(
    @Query() paginationDto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsService.getBlogs(paginationDto);
  }

  @Post('blogs')
  async createBlog(@Body() createBlogType: BlogsDto) {
    return this.blogsService.createBlog(createBlogType);
  }
  @Delete('blogs/:id')
  async deleteBlogById(@Param('id') id: string): Promise<boolean> {
    const findBlogById = await this.blogsService.findBlogById(id);
    if (!findBlogById)
      throw new NotFoundException(`User with ID ${id} not found`);
    return this.blogsService.deleteBlogById(id);
  }
}
