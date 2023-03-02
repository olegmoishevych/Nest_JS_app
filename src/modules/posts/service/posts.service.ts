import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../repository/posts.repository';

@Injectable()
export class PostsService {
  constructor(public postsRepository: PostsRepository) {}
}
