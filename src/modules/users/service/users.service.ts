import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';
import {
  Users,
  UsersViewModel,
  UserType_For_DB,
} from '../schemas/users.schema';
import { ObjectId } from 'mongodb';
import { UserDto } from '../dto/userDto';
import { UserPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAllUsers(
    paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersViewModel[]>> {
    return this.usersRepository.findAllUsers(paginationDto);
  }

  async createUser(user: UserDto): Promise<UsersViewModel> {
    const newUser: Users = {
      id: new ObjectId().toString(),
      login: user.login,
      email: user.email,
      createdAt: new Date().toISOString(),
    };
    return this.usersRepository.createUser(newUser);
  }

  async deleteUserById(id: string): Promise<boolean> {
    const findUserById = await this.usersRepository.findUserById(id);
    if (!findUserById)
      throw new NotFoundException(`User with ID ${id} not found`);
    return this.usersRepository.deleteUserById(id);
  }

  async findUserById(id: string): Promise<UsersViewModel> {
    return this.usersRepository.findUserById(id);
  }
}
