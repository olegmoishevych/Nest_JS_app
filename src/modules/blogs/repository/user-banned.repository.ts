import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BlogsUserViewModel,
  BlogsUserViewModelFor_DB,
  UserBanned,
  UserBannedDocument,
} from '../schemas/user-banned.schema';
import { Model } from 'mongoose';
import { BannedUserDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { DeleteResult } from 'mongodb';
import { BanUserForBloggerDto } from '../dto/bloggerDto';

@Injectable()
export class UserBannedRepository {
  constructor(
    @InjectModel(UserBanned.name)
    private readonly userBannedModel: Model<UserBannedDocument>,
  ) {}
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
  async banUserById(
    bannedUser: BlogsUserViewModelFor_DB,
    id,
  ): Promise<BlogsUserViewModel> {
    return this.userBannedModel.findOneAndUpdate(
      { id },
      { $set: bannedUser },
      { upsert: true },
    );
  }
  async findBannedUserByUserId(userId: string): Promise<BlogsUserViewModel> {
    return this.userBannedModel.findOne({
      id: userId,
      'banInfo.isBanned': true,
    });
  }
  async findBannedUserByBlogId(blogId: string): Promise<BlogsUserViewModel> {
    return this.userBannedModel.findOne({
      blogId,
      'banInfo.isBanned': true,
    });
  }
  async deleteBannedUserById(userId: string, blogId): Promise<DeleteResult> {
    const res = await this.userBannedModel.deleteOne({ id: userId, blogId });
    console.log(res);
    return res;
  }
}
