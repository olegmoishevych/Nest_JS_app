import { Injectable } from '@nestjs/common';
import { PlayerEntity } from '../domain/entites/player.entity';
import { GameEntity } from '../domain/entites/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(GameEntity)
    private readonly repository: Repository<GameEntity>,
  ) {}

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
      .orderBy('player.connectedAt', 'ASC') // players in game should be sorted by connectedAt by default
      .getOne();

    return game;
  }
}
