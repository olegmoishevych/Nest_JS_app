import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
}
