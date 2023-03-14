import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BanInfo,
  Blogs,
  BlogsDocument,
  BlogsViewModel,
} from '../schemas/blogs.schema';
import { Model } from 'mongoose';
import {
  BannedUserDto,
  BanStatusFilterEnum,
  BlogPaginationDto,
} from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsDto, BlogsModal_For_DB } from '../dto/blogsDto';
import { UserModel } from '../../users/schemas/users.schema';
import {
  BlogsUserViewModel,
  BlogsUserViewModelFor_DB,
  UserBanned,
  UserBannedDocument,
} from '../schemas/user-banned.schema';
import { UpdateResult } from 'mongodb';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blogs.name) private readonly blogsModel: Model<BlogsDocument>,
    @InjectModel(UserBanned.name)
    private readonly userBannedModel: Model<UserBannedDocument>,
  ) {}

  async getBlogs(
    paginationType: BlogPaginationDto,
    superAdmin: boolean,
    user?: UserModel,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const filter = user
      ? {
          name: { $regex: paginationType.searchNameTerm ?? '', $options: 'i' },
          ['blogOwnerInfo.userId']: user.id,
          'banInfo.isBanned': false,
        }
      : {
          name: { $regex: paginationType.searchNameTerm ?? '', $options: 'i' },
          'banInfo.isBanned': false,
        };
    const findParams = superAdmin
      ? { _id: 0 }
      : { _id: 0, blogOwnerInfo: 0, banInfo: 0 };
    const findAndSortedBlogs = await this.blogsModel
      .find(filter, findParams)
      .sort({
        [paginationType.sortBy]:
          paginationType.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(paginationType.getSkipSize())
      .limit(paginationType.pageSize)
      .lean();
    const getCountBlogs = await this.blogsModel.countDocuments(filter);
    return new PaginationViewModel<BlogsViewModel[]>(
      getCountBlogs,
      paginationType.pageNumber,
      paginationType.pageSize,
      findAndSortedBlogs,
    );
  }
  async createBlog(blog: BlogsModal_For_DB): Promise<BlogsViewModel> {
    await this.blogsModel.create({ ...blog });
    const { blogOwnerInfo, banInfo, ...blogCopy } = blog;
    return blogCopy;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const result = await this.blogsModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async findBlogWithUserInfoById(id: string): Promise<BlogsModal_For_DB> {
    return this.blogsModel.findOne({ id }, { _id: 0, __v: 0 });
  }

  async findBlogById(id: string): Promise<BlogsModal_For_DB> {
    return this.blogsModel.findOne(
      { id, 'banInfo.isBanned': false },
      { _id: 0, __v: 0, blogOwnerInfo: 0, banInfo: 0 },
    );
  }

  async findBlogByIdForBannedUser(id: string): Promise<BlogsModal_For_DB> {
    return this.blogsModel.findOne(
      { id },
      { _id: 0, __v: 0, blogOwnerInfo: 0 },
    );
  }

  async findBlogWithOwnerId(ownerId: string): Promise<BlogsModal_For_DB> {
    return this.blogsModel.findOne({ id: ownerId }, { _id: 0, __v: 0 });
  }
  async updateBlogById(
    id: string,
    user: BlogsDto,
    userId: string,
  ): Promise<boolean> {
    return this.blogsModel.findOneAndUpdate(
      { id, 'blogOwnerInfo.userId': userId },
      {
        $set: {
          name: user.name,
          description: user.description,
          websiteUrl: user.websiteUrl,
        },
      },
    );
  }
  async banBlogById(
    blogId: string,
    updateBlog: BanInfo,
  ): Promise<UpdateResult> {
    return this.blogsModel.updateOne(
      { id: blogId },
      {
        $set: { banInfo: updateBlog },
      },
    );
  }
}
