import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorator/request.decorator';
import { UserEntity } from '../auth/domain/entities/user.entity';
import { CommandBus } from '@nestjs/cqrs';
import { PairConnectionCommand } from './use-cases/pair-connection.use-case';
import { ViewModelMapper } from './types/viewModelMapper';
import { AnswerDto } from './dto/answerDto';
import { HandleAnswerCommand } from './use-cases/handle-answer.use-case';
import { AnswerViewModel, GamePairViewModel } from './types/game.types';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(
    public command: CommandBus,
    public viewModelMapper: ViewModelMapper,
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
}
