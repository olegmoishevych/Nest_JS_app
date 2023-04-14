import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BanBlogUserDto, BanUserDto } from './dto/userDto';
import { UserModel, UsersModel_For_DB } from './schemas/users.schema';
import {
  BlogPaginationDto,
  QuizQuestionsPaginationDto,
  UserPaginationDtoWithBanStatusDto,
} from '../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../helpers/pagination/pagination-view-model';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { BlogsViewModel } from '../blogs/schemas/blogs.schema';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './use-cases/create-user.use-case';
import { AuthDto } from '../auth/dto/auth.dto';
import { DeleteUserCommand } from './use-cases/delete-user.use-case';
import { DeleteResult } from 'typeorm';
import { UsersSqlRepository } from './repository/users.sql.repository';
import { BlogsSQLqueryRepository } from '../blogs/repository/blogs.SQLquery.repository';
import { UsersSQLQueryRepository } from './repository/users.SQL.query.repository';
import { BanUserByIdForSaCommand } from './use-cases/ban-user-by-id-for-sa-use.case';
import { BanBlogByIdCommand } from './use-cases/banBlogById.use-case';
import { CreateQuizQuestionCommand } from './use-cases/create-quiz-question.use-case';
import { QuizQuestionsDto } from './dto/quizQuestionsDto';
import { QuizQuestionEntity } from '../quiz/domain/entites/quiz-question.entity';
import { PublishQuestionDto } from '../quiz/dto/publishDto';
import { QuizQuestionRepository } from '../quiz/repository/quiz-question.repository';
import { UpdatePublishCommand } from '../quiz/use-cases/updatePublish.use-case';
import { UpdateQuestionByIdCommand } from '../quiz/use-cases/updateQuestionById.use-case';
import { DeleteQuestionByIdCommand } from '../quiz/use-cases/delete-question-by-id-use.case';

@Controller('sa')
export class UsersController {
  constructor(
    public queryRepo: BlogsSQLqueryRepository,
    public usersRepository: UsersSqlRepository,
    public usersQueryRepo: UsersSQLQueryRepository,
    public quizRepo: QuizQuestionRepository,
    private commandBus: CommandBus,
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
    @Body() dto: BanBlogUserDto,
  ): Promise<boolean> {
    return this.commandBus.execute(new BanBlogByIdCommand(id, dto));
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

  @UseGuards(BasicAuthGuard)
  @Post('quiz/questions')
  async createQuizQuestions(@Body() dto: QuizQuestionsDto) {
    return this.commandBus.execute(new CreateQuizQuestionCommand(dto));
  }

  @UseGuards(BasicAuthGuard)
  @Delete('quiz/questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestionById(@Param('id') id: string): Promise<DeleteResult> {
    return this.commandBus.execute(new DeleteQuestionByIdCommand(id));
  }

  @UseGuards(BasicAuthGuard)
  @Put('quiz/questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionById(
    @Param('id') id: string,
    @Body() dto: QuizQuestionsDto,
  ): Promise<QuizQuestionEntity> {
    return this.commandBus.execute(new UpdateQuestionByIdCommand(dto, id));
  }

  @UseGuards(BasicAuthGuard)
  @Put('quiz/questions/:id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestionPublishById(
    @Param('id') id: string,
    @Body() dto: PublishQuestionDto,
  ): Promise<QuizQuestionEntity> {
    return this.commandBus.execute(new UpdatePublishCommand(id, dto));
  }

  @UseGuards(BasicAuthGuard)
  @Get('quiz/questions')
  async findAllQuestions(
    @Query() dto: QuizQuestionsPaginationDto,
  ): Promise<PaginationViewModel<QuizQuestionEntity[]>> {
    return this.quizRepo.findAllQuestions(dto);
  }
}
