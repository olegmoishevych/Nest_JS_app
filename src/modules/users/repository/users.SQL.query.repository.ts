import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { Repository } from 'typeorm';
import { UserPaginationDtoWithBanStatusDto } from '../../helpers/dto/pagination.dto';
import { UsersModel_For_DB } from '../schemas/users.schema';

@Injectable()
export class UsersSQLQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private usersQueryTable: Repository<UserEntity>,
  ) {}

  async getAllUsersBySA(
    dto: UserPaginationDtoWithBanStatusDto,
  ): Promise<PaginationViewModel<UsersModel_For_DB[]>> {
    const builder = this.usersQueryTable
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.banInfo', 'banInfo');
    builder.orderBy(
      `u.${dto.sortBy}`,
      dto.sortDirection.toUpperCase() as 'ASC' | 'DESC',
    );
    if (dto.searchLoginTerm) {
      builder.where('u.login ILIKE :login', {
        login: `%${dto.searchLoginTerm}%`,
      });
    }
    if (dto.searchEmailTerm) {
      builder.orWhere('u.email ILIKE :email', {
        email: `%${dto.searchEmailTerm}%`,
      });
    }
    if (dto.banStatus !== 'all') {
      builder.andWhere('banInfo.isBanned = :isBanned', {
        isBanned: getTrueOrFalse(dto.banStatus),
      });

      function getTrueOrFalse(banStatus: string): boolean {
        switch (banStatus) {
          case 'banned':
            return true;
          case 'notBanned':
            return false;
          default:
            return;
        }
      }
    }

    const [users, total] = await builder
      .select([
        'u.id',
        'u.login',
        'u.email',
        'u.createdAt',
        'banInfo.isBanned',
        'banInfo.banDate',
        'banInfo.banReason',
      ])
      .take(dto.pageSize)
      .skip((dto.pageNumber - 1) * dto.pageSize)
      .getManyAndCount();
    return new PaginationViewModel<any>(
      total,
      dto.pageNumber,
      dto.pageSize,
      users,
    );
  }
}
