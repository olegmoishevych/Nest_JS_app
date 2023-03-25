import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserBannedEntity } from '../domain/entities/user-banned.entity';

@Injectable()
export class UserBannedSQLRepository {
  constructor(
    @InjectRepository(UserBannedEntity)
    private userBannedTable: Repository<UserBannedEntity>,
  ) {}

  async findBannedUserByBlogId(blogId: string): Promise<UserBannedEntity> {
    return this.userBannedTable.findOneBy({ blogId });
  }

  async findBannedUserById(userId: string): Promise<UserBannedEntity> {
    return this.userBannedTable.findOneBy({ id: userId });
  }

  // async createBannedUser(
  //   id: string,
  //   blog: BlogsEntity,
  //   banUserModal: BanUserForBloggerDto,
  //   user: UserEntity,
  // ): Promise<UserBannedEntity> {
  //   const bannedUser = blog.createBannedUser(id, banUserModal, user);
  //   return this.userBannedTable.save(bannedUser);
  // }
  async deleteBannedUser(
    blogId: string,
    userId: string,
  ): Promise<DeleteResult> {
    return this.userBannedTable.delete({ blogId, id: userId });
  }
}
