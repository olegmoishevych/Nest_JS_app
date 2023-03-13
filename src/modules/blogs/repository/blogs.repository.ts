import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument, BlogsViewModel } from '../schemas/blogs.schema';
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
        }
      : {
          name: { $regex: paginationType.searchNameTerm ?? '', $options: 'i' },
        };
    const findParams = superAdmin ? { _id: 0 } : { _id: 0, blogOwnerInfo: 0 };
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
  async getBannedUsersForBlog(
    blogId: string,
    pagination: BannedUserDto,
  ): Promise<PaginationViewModel<BlogsUserViewModel[]>> {
    const filter = {
      login: { $regex: pagination.searchLoginTerm ?? '', $options: 'i' },
      blogId: blogId,
      'banInfo.isBanned': true,
    };
    const findAndSortedUsers = await this.userBannedModel
      .find(filter, { _id: 0, blogId: 0 })
      .sort({
        [pagination.sortBy]: pagination.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(pagination.getSkipSize())
      .limit(pagination.pageSize)
      .lean();
    const getCountBannedUsers = await this.userBannedModel.countDocuments(
      filter,
    );
    return new PaginationViewModel<BlogsUserViewModel[]>(
      getCountBannedUsers,
      pagination.pageNumber,
      pagination.pageSize,
      findAndSortedUsers,
    );
  }
  async createBlog(blog: BlogsModal_For_DB): Promise<BlogsViewModel> {
    await this.blogsModel.create({ ...blog });
    const { blogOwnerInfo, ...blogCopy } = blog;
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

  async banUserById(
    bannedUser: BlogsUserViewModelFor_DB,
  ): Promise<BlogsUserViewModel> {
    return this.userBannedModel.create({ ...bannedUser });
  }
}
