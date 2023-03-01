import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Users,
  UsersDocument,
  UserType,
  UserType_For_DB,
} from '../schemas/users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(Users.name) private readonly usersModel: Model<UsersDocument>,
  ) {}

  async createUser(user: UserType_For_DB): Promise<UserType> {
    const result = await this.usersModel.insertMany(user);
    const { _id, ...newUserCopy } = user;
    return newUserCopy;
  }
  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.usersModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async findUserById(id: string): Promise<UserType> {
    return this.usersModel.findOne({ id });
  }
}
