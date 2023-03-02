import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
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
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string): Promise<boolean> {
    return this.blogsService.deleteBlogById(id);
  }
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
}