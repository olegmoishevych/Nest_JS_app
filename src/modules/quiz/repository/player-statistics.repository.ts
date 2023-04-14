import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { PlayerStatisticsEntity } from '../domain/entites/player-statistics.entity';

@Injectable()
export class PlayerStatisticsRepository {
  constructor(
    @InjectRepository(PlayerStatisticsEntity)
    private readonly repository: Repository<PlayerStatisticsEntity>,
  ) {}

  async create(user: UserEntity): Promise<PlayerStatisticsEntity> {
    const statistics = PlayerStatisticsEntity.create(user);
    return this.repository.save(statistics);
  }

  async findUserStatistics(userId: string): Promise<PlayerStatisticsEntity> {
    return this.repository.findOneBy({ userId });
  }

  async save(stats: PlayerStatisticsEntity): Promise<PlayerStatisticsEntity> {
    return await this.repository.save(stats);
  }
}
