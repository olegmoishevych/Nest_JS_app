import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UserDto } from '../dto/userDto';
import { UserType } from '../schemas/users.schema';

@Controller('api')
export class UsersController {
  constructor(public usersService: UsersService) {}

  @Post('users')
  async createUser(@Body() createdUserType: UserDto): Promise<UserType> {
    return this.usersService.createUser(createdUserType);
  }

  @Delete('users/:id')
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    const findUserById = await this.usersService.findUserById(id);
    if (!findUserById)
      throw new NotFoundException(`User with ID ${id} not found`);
    return this.usersService.deleteUserById(id);
  }
}
