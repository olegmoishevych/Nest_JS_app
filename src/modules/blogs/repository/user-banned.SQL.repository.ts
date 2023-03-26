import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBannedEntity } from '../domain/entities/user-banned.entity';

@Injectable()
export class UserBannedSQLRepository {
  constructor(
    @InjectRepository(UserBannedEntity)
    private userBannedTable: Repository<UserBannedEntity>,
  ) {}

  async findBannedUserByBlogId(
    userId: string,
    blogId: string,
  ): Promise<UserBannedEntity> {
    return this.userBannedTable.findOneBy({ userId: userId, blogId: blogId });
  }

  async findBannedUserById(
    userId: string,
    blogId: string,
  ): Promise<UserBannedEntity> {
    return this.userBannedTable.findOneBy({ userId: userId, blogId: blogId });
  }
  async saveResult(bannedUser: UserBannedEntity): Promise<UserBannedEntity> {
    return this.userBannedTable.save(bannedUser);
  }
}
