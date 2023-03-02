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
} from '@nestjs/common';
import { PostsService } from '../service/posts.service';
import { CreatePostDto } from '../dto/createPostDto';
import { PostsViewModal } from '../schemas/posts.schema';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PaginationDto } from '../../helpers/dto/pagination.dto';

@Controller('api')
export class PostsController {
  constructor(public postsService: PostsService) {}

  @Get('posts')
  async findPosts(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    return this.postsService.findPosts(paginationDto);
  }

  @Post('posts')
  async createPost(@Body() createPost: CreatePostDto): Promise<PostsViewModal> {
    return this.postsService.createPost(createPost);
  }
  @Delete('posts/:id')
  @HttpCode(204)
  async deletePostById(@Param('id') id: string): Promise<boolean> {
    return this.postsService.deletePostById(id);
  }
  @Put('posts/:id')
  @HttpCode(204)
  async updatePostById(
    @Param('id') id: string,
    @Body() updatePost: CreatePostDto,
  ): Promise<boolean> {
    return this.postsService.updatePostById(id, updatePost);
  }
}
