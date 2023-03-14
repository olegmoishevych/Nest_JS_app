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
  UserPaginationDtoWithBanStatusDto,
} from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { BlogsViewModel } from '../../blogs/schemas/blogs.schema';
import { BlogsRepository } from '../../blogs/repository/blogs.repository';
import { BlogsService } from '../../blogs/service/blogs.service';
import { UpdateResult } from 'mongodb';

@Controller('sa')
export class UsersController {
  constructor(
    public usersService: UsersService,
    public blogsRepository: BlogsRepository,
    public blogsService: BlogsService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('/users')
  async findAllUsers(
    @Query() paginationDto: UserPaginationDtoWithBanStatusDto,
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
  @Put('/blogs/:id/ban')
  @HttpCode(204)
  async banBlogById(
    @Param('id') id: string,
    @Body() isBanned: boolean,
  ): Promise<boolean> {
    return this.blogsService.banBlogById(id, isBanned);
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
  async getBlogs(
    @Query() paginationDto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsRepository.getBlogs(paginationDto, true);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/blogs/:id/bind-with-user/:userId')
  async bindBlogWithUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {}
}
