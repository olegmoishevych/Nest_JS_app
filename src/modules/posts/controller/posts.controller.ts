import { Controller, Post } from '@nestjs/common';
import { PostsService } from '../service/posts.service';

@Controller('api')
export class PostsController {
  constructor(public postsService: PostsService) {}
  @Post('posts')
  async createPost() {}
}
