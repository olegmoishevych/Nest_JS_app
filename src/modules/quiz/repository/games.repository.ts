import { Injectable } from '@nestjs/common';
import { PlayerEntity } from '../domain/entites/player.entity';
import { GameEntity } from '../domain/entites/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { PlayerStatisticsEntity } from '../domain/entites/player-statistics.entity';
import { GameStatuses } from '../types/game.types';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly repository: Repository<GameEntity>,
  ) {}

  async createGame(user: UserEntity, userStatistics: PlayerStatisticsEntity) {
    const newGame = GameEntity.create(user, userStatistics);
    return this.save(newGame);
  }

  async findPendingGame(): Promise<GameEntity> {
    return this.repository.findOneBy({ status: GameStatuses.PENDING });
  }

  async findGameById(id: string): Promise<GameEntity> {
    return this.repository.findOne({
      where: { id },
      order: { players: { connectedAt: 'ASC' } },
    }); // players in game should be sorted by connectedAt by default
  }

  async findGameByIdWithPlayersWithStatistics(id: string): Promise<GameEntity> {
    return this.repository.findOne({
      where: { id },
      relations: { players: { statistics: true } },
    });
  }

  async findAllActiveGames(): Promise<GameEntity[]> {
    return this.repository.find({
      where: { status: GameStatuses.ACTIVE },
      order: { players: { connectedAt: 'ASC' } },
    }); // players in game should be sorted by connectedAt by default
  }

  async findActiveOrPendingGameByUserId(userId: string): Promise<GameEntity> {
    const game = await this.repository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.players', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('player2.gameId')
          .from(PlayerEntity, 'player2')
          .where('player2.userId = :userId', { userId })
          .getQuery();

        return 'game.id IN ' + subQuery;
      })
      .andWhere('game.status IN (:...statuses)', {
        statuses: ['Active', 'PendingSecondPlayer'],
      })
      .orderBy('player.connectedAt', 'ASC')
      .getOne();
    return game;
  }

  async save(game: GameEntity): Promise<GameEntity> {
    return await this.repository.save(game);
  }
}
