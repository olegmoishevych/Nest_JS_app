import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BanInfo,
  Blogs,
  BlogsDocument,
  BlogsViewModel,
} from '../schemas/blogs.schema';
import { Model, FilterQuery, ProjectionFields } from 'mongoose';
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

  async getBlogsForPublic(
    paginationType: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const filter: FilterQuery<BlogsModal_For_DB> = {
      name: { $regex: paginationType.searchNameTerm ?? '', $options: 'i' },
      'banInfo.isBanned': false,
    };
    const projection: ProjectionFields<BlogsModal_For_DB> = {
      _id: 0,
      banInfo: 0,
      blogOwnerInfo: 0,
    };
    return this.getBlogs(paginationType, filter, projection);
  }

  async getBlogsForOwner(
    paginationType: BlogPaginationDto,
    user: UserModel,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const filter: FilterQuery<BlogsModal_For_DB> = {
      name: { $regex: paginationType.searchNameTerm ?? '', $options: 'i' },
      'blogOwnerInfo.userId': user.id,
      'banInfo.isBanned': false,
    };
    const projection: ProjectionFields<BlogsModal_For_DB> = {
      _id: 0,
      banInfo: 0,
      blogOwnerInfo: 0,
    };
    return this.getBlogs(paginationType, filter, projection);
  }

  async getBlogsForSA(
    paginationType: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const filter: FilterQuery<BlogsModal_For_DB> = {
      name: { $regex: paginationType.searchNameTerm ?? '', $options: 'i' },
    };
    const projection: ProjectionFields<BlogsModal_For_DB> = {
      _id: 0,
    };
    return this.getBlogs(paginationType, filter, projection);
  }
  private async getBlogs(
    paginationType: BlogPaginationDto,
    filter: FilterQuery<BlogsModal_For_DB>,
    projection: ProjectionFields<BlogsModal_For_DB>,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const findAndSortedBlogs = await this.blogsModel
      .find(filter, projection)
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

  async findBlogWithOwnerId(blogId: string): Promise<BlogsModal_For_DB> {
    return this.blogsModel
      .find({ blogId, 'banInfo.isBanned': true }, { _id: 0, __v: 0 })
      .lean();
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
