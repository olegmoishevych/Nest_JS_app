import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsViewModal, Posts, PostsDocument } from '../schemas/posts.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Posts.name) private readonly postsModel: Model<PostsDocument>,
  ) {}
  async createPost(newPost: any): Promise<PostsViewModal> {
    const result = await this.postsModel.insertMany(newPost);
    const { _id, __v, ...postCopy } = newPost;
    return postCopy;
  }
}
