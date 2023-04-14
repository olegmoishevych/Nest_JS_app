import { ForbiddenException, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import { GamesRepository } from '../repository/games.repository';
import { PlayerStatisticsRepository } from '../repository/player-statistics.repository';

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
  ) {}

  async execute({ userId }: PairConnectionCommand) {
    const user = await this.usersRepo.findUserById(userId);
    const isUserHasActiveOrPendingGame =
      await this.gamesRepo.findActiveOrPendingGameByUserId(userId);
    if (isUserHasActiveOrPendingGame)
      throw new ForbiddenException(
        'You are already participating in active pair',
      );
  }
}
