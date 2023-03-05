import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Users,
  UsersDocument,
  UsersModel_For_DB,
  UsersViewModel,
} from '../schemas/users.schema';
import { Model } from 'mongoose';
import { UserPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<UsersDocument>,
  ) {}

  async findAllUsers(
    paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    const filter = {
      $or: [
        {
          login: { $regex: paginationDto.searchLoginTerm ?? '', $options: 'i' },
        },
        {
          email: {
            $regex: paginationDto.searchEmailTerm ?? '',
            $options: 'i',
          },
        },
      ],
    };
    const findAndSortedUsers = await this.usersModel
      .find(filter, { _id: 0, passwordHash: 0, emailConfirmation: 0 })
      .sort({
        [paginationDto.sortBy]: paginationDto.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(paginationDto.getSkipSize())
      .limit(paginationDto.pageSize)
      .lean();
    const getCountUsers = await this.usersModel.countDocuments(filter);
    return new PaginationViewModel(
      getCountUsers,
      paginationDto.pageNumber,
      paginationDto.pageSize,
      findAndSortedUsers,
    );
  }

  async createUser(user: Users): Promise<UsersViewModel> {
    const result = await this.usersModel.create({ ...user });
    const { passwordHash, emailConfirmation, ...userCopy } = user;
    return userCopy;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.usersModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async findUserById(id: string): Promise<UsersModel_For_DB> {
    return this.usersModel.findOne({ id });
  }
}
