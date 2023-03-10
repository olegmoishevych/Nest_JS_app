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

@Controller('users')
export class UsersController {
  constructor(public usersService: UsersService) {}

  @Get('/')
  async findAllUsers(
    @Query() paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    return this.usersService.findAllUsers(paginationDto);
  }

  @UseGuards(BasicAuthGuard)
  @Post('/')
  async createUser(@Body() createdUserType: UserDto): Promise<UserModel> {
    return this.usersService.createUser(createdUserType);
  }
  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUserById(id);
  }
}
