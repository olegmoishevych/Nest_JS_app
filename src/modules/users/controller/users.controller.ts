import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UserDto } from '../dto/userDto';
import { UserModel, UsersModel_For_DB } from '../schemas/users.schema';
import { UserPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';

@Controller('api')
export class UsersController {
  constructor(public usersService: UsersService) {}

  @Get('users')
  async findAllUsers(
    @Query() paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    return this.usersService.findAllUsers(paginationDto);
  }

  @UseGuards(BasicAuthGuard)
  @Post('users')
  async createUser(@Body() createdUserType: UserDto): Promise<UserModel> {
    return this.usersService.createUser(createdUserType);
  }
  @UseGuards(BasicAuthGuard)
  @Delete('users/:id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUserById(id);
  }
}
