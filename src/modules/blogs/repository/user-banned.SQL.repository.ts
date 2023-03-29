import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { BannedUserForBlogEntity } from '../domain/entities/banned-user-for-blog.entity';
import { BanUserForBloggerDto } from '../dto/bloggerDto';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { BlogsEntity } from '../domain/entities/blogs.entity';

@Injectable()
export class UserBannedSQLRepository {
  constructor(
    @InjectRepository(BannedUserForBlogEntity)
    private userBannedTable: Repository<BannedUserForBlogEntity>,
  ) {}

  async findBannedUserByBlogAndUserIds(
    userId: string,
    blogId: string,
  ): Promise<BannedUserForBlogEntity> {
    return this.userBannedTable.findOneBy({ userId: userId, blogId: blogId });
  }

  async findBannedUserByBlogId(
    blogId: string,
  ): Promise<BannedUserForBlogEntity> {
    return this.userBannedTable.findOneBy({ blogId });
  }

  async createBannedUser(
    blog: BlogsEntity,
    dto: BanUserForBloggerDto,
    user: UserEntity,
  ): Promise<BannedUserForBlogEntity> {
    const bannedUser = blog.createBannedUser(blog, dto, user);
    return this.userBannedTable.save(bannedUser);
  }

  async deleteBannedUser(blogId: string): Promise<DeleteResult> {
    return this.userBannedTable.delete({ blogId });
  }
}
