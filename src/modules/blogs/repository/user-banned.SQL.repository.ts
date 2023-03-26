import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannedUserForBlogEntity } from '../domain/entities/banned-user-for-blog.entity';

@Injectable()
export class UserBannedSQLRepository {
  constructor(
    @InjectRepository(BannedUserForBlogEntity)
    private userBannedTable: Repository<BannedUserForBlogEntity>,
  ) {}

  async findBannedUserByBlogId(
    userId: string,
    blogId: string,
  ): Promise<BannedUserForBlogEntity> {
    return this.userBannedTable.findOneBy({ userId: userId, blogId: blogId });
  }

  async findBannedUserById(
    userId: string,
    blogId: string,
  ): Promise<BannedUserForBlogEntity> {
    return this.userBannedTable.findOneBy({ userId: userId, blogId: blogId });
  }
  async saveResult(
    bannedUser: BannedUserForBlogEntity,
  ): Promise<BannedUserForBlogEntity> {
    return this.userBannedTable.save(bannedUser);
  }
}
