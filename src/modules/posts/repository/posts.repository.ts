import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsDocument } from '../schemas/posts.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Posts.name) private readonly postsModel: Model<PostsDocument>,
  ) {}
}
