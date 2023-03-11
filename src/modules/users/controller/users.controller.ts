import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { BanUserDto, UserDto } from '../dto/userDto';
import { UserModel, UsersModel_For_DB } from '../schemas/users.schema';
import {
  BlogPaginationDto,
  UserPaginationDto,
} from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { BlogsService } from '../../blogs/service/blogs.service';

@Controller('sa')
export class UsersController {
  constructor(
    public usersService: UsersService,
    public blogsService: BlogsService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('/users')
  async findAllUsers(
    @Query() paginationDto: UserPaginationDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    return this.usersService.findAllUsers(paginationDto);
  }

  @UseGuards(BasicAuthGuard)
  @Post('/users')
  async createUser(@Body() createdUserType: UserDto): Promise<UserModel> {
    return this.usersService.createUser(createdUserType);
  }
  @UseGuards(BasicAuthGuard)
  @Delete('/users/:id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string): Promise<boolean> {
    return this.usersService.deleteUserById(id);
  }
  @UseGuards(BasicAuthGuard)
  @Put('/users/:id/ban')
  @HttpCode(204)
  async banUserById(
    @Param('id') id: string,
    @Body() banUserModel: BanUserDto,
  ): Promise<boolean> {
    return this.usersService.banUserById(id, banUserModel);
  }
  @UseGuards(BasicAuthGuard)
  @Get('/blogs')
  async getBlogs(@Param() paginationDto: BlogPaginationDto) {
    return this.blogsService.getBlogs(paginationDto, true);
  }
}
