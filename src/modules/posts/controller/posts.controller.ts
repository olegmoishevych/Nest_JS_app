import { Body, Controller, Post } from '@nestjs/common';
import { PostsService } from '../service/posts.service';
import { CreatePostDto } from '../dto/createPostDto';
import { PostsViewModal } from '../schemas/posts.schema';

@Controller('api')
export class PostsController {
  constructor(public postsService: PostsService) {}
  @Post('posts')
  async createPost(@Body() createPost: CreatePostDto): Promise<PostsViewModal> {
    return this.postsService.createPost(createPost);
  }
}
