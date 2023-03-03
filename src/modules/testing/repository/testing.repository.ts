import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UsersDocument } from '../../users/schemas/users.schema';
import { Model } from 'mongoose';
import { Blogs, BlogsDocument } from '../../blogs/schemas/blogs.schema';
import {
  Comments,
  CommentsDocument,
} from '../../comments/schema/comments.schema';
import { Posts, PostsDocument } from '../../posts/schemas/posts.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blogs.name) private readonly blogsModel: Model<BlogsDocument>,
    @InjectModel(Posts.name) private readonly postsModel: Model<PostsDocument>,
    @InjectModel(Users.name) private readonly usersModel: Model<UsersDocument>,
    @InjectModel(Comments.name)
    private readonly commentsModel: Model<CommentsDocument>,
  ) {}
  async deleteAllData(): Promise<boolean> {
    try {
      await Promise.all([
        this.usersModel.deleteMany(),
        this.blogsModel.deleteMany(),
        this.postsModel.deleteMany(),
        this.commentsModel.deleteMany(),
      ]);
      return true;
    } catch (e) {
      return false;
    }
  }
}
