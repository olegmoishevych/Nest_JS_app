import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBannedEntity } from '../domain/entities/user-banned.entity';

@Injectable()
export class BannedUserQueryRepository {
  constructor(
    @InjectRepository(UserBannedEntity)
    private bannedUserTable: Repository<UserBannedEntity>,
  ) {}
}
