import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UserDto } from '../dto/userDto';
import { UsersViewModel } from '../schemas/users.schema';
import { UserPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Controller('api')
export class UsersController {
  constructor(public usersService: UsersService) {}

  @Get('users')
  async findAllUsers(
    @Query() paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersViewModel[]>> {
    return this.usersService.findAllUsers(paginationDto);
  }

  @Post('users')
  async createUser(@Body() createdUserType: UserDto): Promise<UsersViewModel> {
    return this.usersService.createUser(createdUserType);
  }

  @Delete('users/:id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUserById(id);
  }
}
