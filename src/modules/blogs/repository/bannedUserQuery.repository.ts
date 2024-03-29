import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannedUserForBlogEntity } from '../domain/entities/banned-user-for-blog.entity';
import { BannedUserDto } from '../../helpers/dto/pagination.dto';

@Injectable()
export class BannedUserQueryRepository {
  constructor(
    @InjectRepository(BannedUserForBlogEntity)
    private readonly bannedUserTable: Repository<BannedUserForBlogEntity>,
  ) {}

  async getBannedUsersForBlog(blogId: string, dto: BannedUserDto) {
    const builder = await this.bannedUserTable
      .createQueryBuilder('banned')
      .where('banned.blogId = :blogId', { blogId: blogId })
      .orderBy(
        `banned.${dto.sortBy}`,
        dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      );
    if (dto.searchLoginTerm) {
      builder.where('banned.login ILIKE :login', {
        login: `%${dto.searchLoginTerm}%`,
      });
    }
    const [users, total] = await builder
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();
    const mappedUsers = users.map((u) => {
      return {
        id: u.userId,
        login: u.login,
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.createdAt,
          banReason: u.banReason,
        },
      };
    });
    return {
      pagesCount: Math.ceil(total / dto.pageSize),
      page: dto.pageNumber,
      pageSize: dto.pageSize,
      totalCount: total,
      items: mappedUsers,
    };
  }
}
