import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorator/request.decorator';
import { UserEntity } from '../auth/domain/entities/user.entity';
import { CommandBus } from '@nestjs/cqrs';
import { PairConnectionCommand } from './use-cases/pair-connection.use-case';
import { ViewModelMapper } from './types/viewModelMapper';
import { AnswerDto } from './dto/answerDto';
import { HandleAnswerCommand } from './use-cases/handle-answer.use-case';
import { AnswerViewModel, GamePairViewModel } from './types/game.types';
import { GamesRepository } from './repository/games.repository';
import { ParseNumberPipe } from './types/parse-number';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(
    public command: CommandBus,
    public viewModelMapper: ViewModelMapper,
    public gamesRepo: GamesRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('pair/connection')
  async pairConnection(@User() user: UserEntity): Promise<GamePairViewModel> {
    const newGame = await this.command.execute(
      new PairConnectionCommand(user.id),
    );
    return this.viewModelMapper.getGameViewModel(newGame);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pairs/my-current/answers')
  async currentAnswer(
    @User() user: UserEntity,
    @Body() dto: AnswerDto,
  ): Promise<AnswerViewModel> {
    const answer = await this.command.execute(
      new HandleAnswerCommand(dto, user.id),
    );
    return this.viewModelMapper.getAnswerViewModel(answer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my-current')
  async findCurrentGame(@User() user: UserEntity): Promise<GamePairViewModel> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(user.id);
    if (!game)
      throw new NotFoundException('You dont have any active or pending games');
    return this.viewModelMapper.getGameViewModel(game);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/:id')
  async findGameById(
    @Param('id', ParseNumberPipe) id: string,
    @User() user: UserEntity,
  ): Promise<GamePairViewModel> {
    const game = await this.gamesRepo.findGameById(id);
    if (!game) throw new NotFoundException('Game not found');
    if (!game.isPlayerParticipant(user.id))
      throw new ForbiddenException('You are not participant in this game');
    return this.viewModelMapper.getGameViewModel(game);
  }
}
