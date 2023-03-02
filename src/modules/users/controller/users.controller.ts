import {
  Body,
  Controller,
  Delete,
  Get,
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
  @Get('users')
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Post('users')
  async createUser(@Body() createdUserType: UserDto): Promise<UserType> {
    return this.usersService.createUser(createdUserType);
  }

  @Delete('users/:id')
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUserById(id);
  }
}
