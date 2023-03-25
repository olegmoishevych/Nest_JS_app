import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBannedEntity } from '../domain/entities/user-banned.entity';
import { BannedUserDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsUserViewModel } from '../schemas/user-banned.schema';

@Injectable()
export class BannedUserQueryRepository {
  constructor(
    @InjectRepository(UserBannedEntity)
    private bannedUserTable: Repository<UserBannedEntity>,
  ) {}

  async getBannedUsersForBlog(
    blogId: string,
    dto: BannedUserDto,
  ): Promise<PaginationViewModel<BlogsUserViewModel[]>> {
    const builder = await this.bannedUserTable
      .createQueryBuilder('banned')
      .leftJoinAndSelect('banned.banInfo', 'banInfo')
      .where('banned.blogId = :blogId', { blogId: blogId })
      .andWhere('banInfo.isBanned = true');
    if (dto.searchLoginTerm) {
      builder.where('banned.login ILIKE :login', {
        login: `%${dto.searchLoginTerm}%`,
      });
    }
    const [users, total] = await builder
      .select([
        'banned.id',
        'banned.login',
        'banInfo.isBanned',
        'banInfo.banDate',
        'banInfo.banReason',
      ])
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      // .orderBy(
      //   `banned.${dto.sortBy}`,
      //   dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      // )
      .getManyAndCount();
    return new PaginationViewModel<BlogsUserViewModel[]>(
      total,
      dto.pageNumber,
      dto.pageSize,
      users,
    );
  }
}
