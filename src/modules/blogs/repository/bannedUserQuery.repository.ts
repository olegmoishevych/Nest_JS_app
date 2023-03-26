import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBannedEntity } from '../domain/entities/user-banned.entity';
import { BannedUserDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class BannedUserQueryRepository {
  constructor(
    @InjectRepository(UserBannedEntity)
    private bannedUserTable: Repository<UserBannedEntity>,
  ) {}

  async getBannedUsersForBlog(
    blogId: string,
    dto: BannedUserDto,
  ): Promise<PaginationViewModel<UserBannedEntity[]>> {
    const builder = await this.bannedUserTable
      .createQueryBuilder('banned')
      .where('banned.blogId = :blogId', { blogId: blogId })
      .andWhere('banned.isBanned = true')
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
    return new PaginationViewModel<any>(
      total,
      dto.pageNumber,
      dto.pageSize,
      mappedUsers,
    );
  }
}
