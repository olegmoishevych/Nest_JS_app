import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import { GamesRepository } from '../repository/games.repository';
import { PlayerStatisticsRepository } from '../repository/player-statistics.repository';
import { PlayerStatisticsEntity } from '../domain/entites/player-statistics.entity';
import { GameEntity, QuestionInGame } from '../domain/entites/game.entity';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { QuizQuestionRepository } from '../repository/quiz-question.repository';

@Injectable()
export class PairConnectionCommand {
  constructor(readonly userId: string) {}
}

@CommandHandler(PairConnectionCommand)
export class PairConnectionUseCase {
  constructor(
    public usersRepo: UsersSqlRepository,
    public gamesRepo: GamesRepository,
    public playerStatisticRepo: PlayerStatisticsRepository,
    public quizQuestionRepo: QuizQuestionRepository,
  ) {}

  async execute({ userId }: PairConnectionCommand) {
    const user = await this.usersRepo.findUserById(userId);
    const isUserHasActiveOrPendingGame =
      await this.gamesRepo.findActiveOrPendingGameByUserId(userId);
    if (isUserHasActiveOrPendingGame)
      throw new ForbiddenException(
        'You are already participating in active pair',
      );
    let playerStatistics: PlayerStatisticsEntity =
      await this.playerStatisticRepo.findUserStatistics(user.id);
    if (!playerStatistics) {
      playerStatistics = await this.playerStatisticRepo.create(user);
    }

    const pendingSecondPlayerGame = await this.gamesRepo.findPendingGame();
    if (!pendingSecondPlayerGame)
      return await this.gamesRepo.createGame(user, playerStatistics);
    return await this.startGame(
      pendingSecondPlayerGame,
      user,
      playerStatistics,
    );
  }
  async startGame(
    game: GameEntity,
    secondPlayer: UserEntity,
    secondUserStatistics: PlayerStatisticsEntity,
  ) {
    const questionsForGame =
      await this.quizQuestionRepo.getRandomQuestionsForStartGame();
    const questions: QuestionInGame[] = questionsForGame.map((q) => ({
      id: q.id,
      body: q.body,
      correctAnswers: q.correctAnswers,
    })); // map because in questionsForGame plenty of unnecessary fields
    game.startGame(secondPlayer, questions, secondUserStatistics);
    return await this.gamesRepo.save(game);
  }
}
