import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UsersDocument } from '../../users/schemas/users.schema';
import { Model } from 'mongoose';
import { Blogs, BlogsDocument } from '../../blogs/schemas/blogs.schema';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectModel(Blogs.name) private readonly blogsModel: Model<BlogsDocument>,
    @InjectModel(Users.name) private readonly usersModel: Model<UsersDocument>,
  ) {}
  async deleteAllData(): Promise<boolean> {
    const clearBlogs = await this.blogsModel.deleteMany({});
    const clearUsers = await this.usersModel.deleteMany({});
    return clearBlogs.deletedCount === 1 && clearUsers.deletedCount === 1;
  }
}
