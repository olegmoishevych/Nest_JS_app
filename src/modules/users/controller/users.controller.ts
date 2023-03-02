import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UserDto } from '../dto/userDto';
import { UserType } from '../schemas/users.schema';
import { UserPaginationDto } from '../../helpers/dto/pagination.dto';

@Controller('api')
export class UsersController {
  constructor(public usersService: UsersService) {}

  @Get('users')
  async findAllUsers(@Query() paginationDto: UserPaginationDto) {
    return this.usersService.findAllUsers(paginationDto);
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
