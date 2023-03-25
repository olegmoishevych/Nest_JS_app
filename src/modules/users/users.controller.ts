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
import { UsersService } from './service/users.service';
import { BanBlogUserDto, BanUserDto } from './dto/userDto';
import { UserModel, UsersModel_For_DB } from './schemas/users.schema';
import {
  BlogPaginationDto,
  UserPaginationDtoWithBanStatusDto,
} from '../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../helpers/pagination/pagination-view-model';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { BlogsViewModel } from '../blogs/schemas/blogs.schema';
import { BlogsService } from '../blogs/service/blogs.service';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './use-cases/create-user.use-case';
import { AuthDto } from '../auth/dto/auth.dto';
import { DeleteUserCommand } from './use-cases/delete-user.use-case';
import { DeleteResult } from 'typeorm';
import { UsersSqlRepository } from './repository/users.sql.repository';
import { BlogsSQLqueryRepository } from '../blogs/repository/blogs.SQLquery.repository';
import { UsersSQLQueryRepository } from './repository/users.SQL.query.repository';
import { BanUserByIdForSaCommand } from './use-cases/ban-user-by-id-for-sa-use.case';

@Controller('sa')
export class UsersController {
  constructor(
    public usersService: UsersService,
    public queryRepo: BlogsSQLqueryRepository,
    public usersRepository: UsersSqlRepository,
    public usersQueryRepo: UsersSQLQueryRepository,
    private commandBus: CommandBus,
    public blogsService: BlogsService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('/users')
  async findAllUsers(
    @Query() dto: UserPaginationDtoWithBanStatusDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    return this.usersQueryRepo.getAllUsersBySA(dto);
  }

  @UseGuards(BasicAuthGuard)
  @Post('/users')
  async createUser(@Body() dto: AuthDto): Promise<UserModel> {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/users/:id')
  @HttpCode(204)
  async deleteUserById(@Param('id') id: string): Promise<DeleteResult> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }

  @UseGuards(BasicAuthGuard)
  @Put('/blogs/:id/ban')
  @HttpCode(204)
  async banBlogById(
    @Param('id') id: string,
    @Body() isBanned: BanBlogUserDto,
  ): Promise<boolean> {
    return this.blogsService.banBlogById(id, isBanned.isBanned);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/users/:id/ban')
  @HttpCode(204)
  async banUserById(
    @Param('id') id: string,
    @Body() dto: BanUserDto,
  ): Promise<boolean> {
    return this.commandBus.execute(new BanUserByIdForSaCommand(id, dto));
  }

  @UseGuards(BasicAuthGuard)
  @Get('/blogs')
  async getBlogs(
    @Query() dto: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.queryRepo.getBlogsForSA(dto);
  }
}
