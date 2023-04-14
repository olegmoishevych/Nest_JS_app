import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { add } from 'date-fns';
import { Answer } from '../domain/entites/player.entity';
import { GamesRepository } from '../repository/games.repository';
import { AnswerDto } from '../dto/answerDto';
import { GameEntity } from '../domain/entites/game.entity';
import { PlayerStatisticsRepository } from '../repository/player-statistics.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HandleAnswerCommand {
  constructor(readonly dto: AnswerDto, readonly userId: string) {}
}

@CommandHandler(HandleAnswerCommand)
export class HandleAnswerUseCase implements ICommand {
  constructor(
    public gamesRepo: GamesRepository,
    public playerStatisticRepo: PlayerStatisticsRepository,
  ) {}

  async execute({ dto, userId }: HandleAnswerCommand): Promise<Answer> {
    const game = await this.gamesRepo.findActiveOrPendingGameByUserId(userId);
    if (
      !game ||
      !game.isActive() ||
      game.isPlayerAnsweredAllQuestions(userId)
    ) {
      throw new ForbiddenException(
        'You are not inside active pair or already answered to all questions',
      );
    }
    const answer = game.handleAnswer(userId, dto.answer);
    const player = game.findPlayerById(userId);
    if (
      player.isFinishedAnsweringAllQuestions() &&
      !game.isBothPlayersAnsweredAllQuestions()
    ) {
      player.makeFirstFinished();
      game.forciblyFinishDate = add(new Date(), { seconds: 10 }); // after 10 seconds game will finish automatically using CRON
    }
    if (game.canBeFinished()) {
      await this.finishGame(game);
    }
    await this.gamesRepo.save(game);
    return answer;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkAndFinishActiveGames() {
    const activeGames = await this.gamesRepo.findAllActiveGames();
    for (const game of activeGames) {
      if (
        game.forciblyFinishDate !== null &&
        game.forciblyFinishDate < new Date()
      ) {
        await this.finishGame(game, true);
      }
    }
  }

  async finishGame(game: GameEntity, isForcibly = false) {
    game.finishGame(isForcibly);
    await this.gamesRepo.save(game); //because when updating statistics, there should be a game with actual information
    await this.updatePlayersStatistics(game);
  }

  async updatePlayersStatistics(game: GameEntity) {
    const { players } =
      await this.gamesRepo.findGameByIdWithPlayersWithStatistics(game.id);
    for (const player of players) {
      const statistics = player.statistics;
      statistics.gamesCount++;
      statistics.sumScore += player.score;
      statistics.avgScores = (
        statistics.sumScore / statistics.gamesCount
      ).toFixed(2);

      if (game.winnerId === null) {
        statistics.drawsCount++;
      }
      if (game.winnerId === player.userId) {
        statistics.winsCount++;
      }
      if (game.winnerId !== player.userId && game.winnerId !== null) {
        statistics.lossesCount++;
      }
      await this.playerStatisticRepo.save(statistics);
    }
  }
}
