import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BanInfo,
  EmailConfirmation,
  UserModel,
  Users,
  UsersDocument,
  UsersModel_For_DB,
} from '../schemas/users.schema';
import { Model } from 'mongoose';
import {
  BanStatusFilterEnum,
  UserPaginationDto,
  UserPaginationDtoWithBanStatusDto,
} from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { LoginOrEmailDto } from '../../auth/dto/auth.dto';
import {
  RecoveryCode,
  RecoveryCodeDocument,
  RecoveryCodeModal,
} from '../../auth/schemas/recoveryCode.schemas';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<UsersDocument>,
    @InjectModel(RecoveryCode.name)
    private readonly recoveryCodeModel: Model<RecoveryCodeDocument>,
  ) {}

  private getBanStatusFilter(banStatus: BanStatusFilterEnum) {
    switch (banStatus) {
      case BanStatusFilterEnum.Banned:
        return { 'banInfo.isBanned': true };
      case BanStatusFilterEnum.NotBanned:
        return { 'banInfo.isBanned': false };
      default:
        return {
          $or: [{ 'banInfo.isBanned': true }, { 'banInfo.isBanned': false }],
        };
    }
  }

  async findAllUsers(
    paginationDto: UserPaginationDtoWithBanStatusDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    const filter = {
      $and: [
        {
          $or: [
            {
              login: {
                $regex: paginationDto.searchLoginTerm ?? '',
                $options: 'i',
              },
            },
            {
              email: {
                $regex: paginationDto.searchEmailTerm ?? '',
                $options: 'i',
              },
            },
          ],
        },
        this.getBanStatusFilter(paginationDto.banStatus),
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

  async createUser(user: UsersModel_For_DB): Promise<UsersModel_For_DB> {
    return this.usersModel.create({ ...user });
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.usersModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async findUserById(id: string): Promise<UsersModel_For_DB> {
    return this.usersModel.findOne({ id });
  }

  async findUserByCode(code: string): Promise<UsersModel_For_DB> {
    return this.usersModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async updateConfirmationCode(
    user: UsersModel_For_DB,
  ): Promise<UsersModel_For_DB> {
    return this.usersModel.findOneAndUpdate(
      { id: user.id },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
  }

  async findUserByEmail(email: string): Promise<UsersModel_For_DB> {
    return this.usersModel.findOne({ email });
  }

  async updateUserConfirmationDate(
    user: UsersModel_For_DB,
    newEmailConfirmation: EmailConfirmation,
  ): Promise<UsersModel_For_DB> {
    return this.usersModel.findOneAndUpdate(
      { id: user.id },
      { $set: { emailConfirmation: newEmailConfirmation } },
    );
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UsersModel_For_DB> {
    return this.usersModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async addRecoveryUserCode(
    recoveryCode: RecoveryCodeModal,
  ): Promise<RecoveryCodeModal> {
    return this.recoveryCodeModel.create({ ...recoveryCode });
  }
  async findRecoveryUserCode(recoveryCode: string): Promise<RecoveryCodeModal> {
    return this.recoveryCodeModel.findOne({ recoveryCode });
  }
  async updateUserHash(email: string, hash: string): Promise<UserModel> {
    return this.usersModel.findOneAndUpdate(
      { email },
      { $set: { passwordHash: hash } },
    );
  }
  async banUserById(id: string, updateUser: BanInfo): Promise<boolean> {
    return this.usersModel.findOneAndUpdate(
      { id },
      { $set: { banInfo: updateUser } },
    );
  }

  async findUserByLogin(login: string) {
    return this.usersModel.findOne({ login });
  }
}
