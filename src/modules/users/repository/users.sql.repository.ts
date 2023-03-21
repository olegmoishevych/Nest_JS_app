import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import {
  BanStatusFilterEnum,
  UserPaginationDtoWithBanStatusDto,
} from 'src/modules/helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectRepository(UserEntity) private userTable: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  async getAllUsersBySA(paginationDto: UserPaginationDtoWithBanStatusDto) {
    await this.userTable.delete({});
    const countQuery = `
      SELECT COUNT(*)
      FROM public."User"
      LEFT JOIN "BanInfo"  ON "User"."id" = "BanInfo"."id"
      WHERE ("User"."login" ilike $1 OR "User"."email" ilike $2)
        AND
        CASE
        WHEN '${paginationDto.banStatus}' = '${BanStatusFilterEnum.NotBanned}'
        THEN "BanInfo"."isBanned" = false
        WHEN '${paginationDto.banStatus}' = '${BanStatusFilterEnum.Banned}'
        THEN "BanInfo"."isBanned" = true
        ELSE "BanInfo"."isBanned" IN (true, false)
        END`;

    const countResult = await this.dataSource.query(countQuery, [
      '%' + paginationDto.searchLoginTerm + '%',
      '%' + paginationDto.searchEmailTerm + '%',
    ]);

    const dataQuery = `
      SELECT "User"."id", "User"."login", "User"."email", "User"."createdAt",
             "BanInfo"."isBanned", "BanInfo"."banDate", "BanInfo"."banReason"
      FROM public."User"
      LEFT JOIN "BanInfo"  ON "User"."id" = "BanInfo"."id"
      WHERE ("User"."login" ilike $1 OR "User"."email" ilike $2)
        AND
        CASE
        WHEN '${paginationDto.banStatus}' = '${BanStatusFilterEnum.NotBanned}'
        THEN "BanInfo"."isBanned" = false
        WHEN '${paginationDto.banStatus}' = '${BanStatusFilterEnum.Banned}'
        THEN "BanInfo"."isBanned" = true
        ELSE "BanInfo"."isBanned" IN (true, false)
        END
        ORDER BY "${paginationDto.sortBy}" ${paginationDto.sortDirection}
              OFFSET $4 ROWS FETCH NEXT $3 ROWS ONLY`;

    const dataResult = await this.dataSource.query(dataQuery, [
      '%' + paginationDto.searchLoginTerm + '%',
      '%' + paginationDto.searchEmailTerm + '%',
      paginationDto.pageSize,
      (paginationDto.pageNumber - 1) * paginationDto.pageSize,
    ]);

    const mappedUsers = dataResult.map((u) => ({
      id: u.id,
      login: u.id,
      email: u.email,
      createdAt: u.createdAt,
      banInfo: {
        isBanned: u.isBanned,
        banDate: u.banDate,
        banReason: u.banReason,
      },
    }));
    return new PaginationViewModel(
      countResult[0].count,
      paginationDto.pageNumber,
      paginationDto.pageSize,
      mappedUsers,
    );
  }
  async createUser(
    login: string,
    email: string,
    passwordHash: string,
  ): Promise<UserEntity> {
    const newUser = UserEntity.create(login, email, passwordHash);
    return this.userTable.save(newUser);
  }

  async findUserByLogin(login: string): Promise<UserEntity> {
    return this.userTable.findOneBy({ login });
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return this.userTable.findOneBy({ email });
  }

  async deleteUserById(id: string): Promise<DeleteResult> {
    return this.userTable.delete(id);
  }

  async findUserById(id: string): Promise<UserEntity> {
    return this.userTable.findOneBy({ id });
  }

  async findUserByCode(code: string): Promise<UserEntity> {
    return this.userTable
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.emailConfirmation', 'UserEmailConfirmation')
      .where('UserEmailConfirmation.confirmationCode = :code', { code })
      .getOne();
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<UserEntity> {
    return this.userTable
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.passwordRecovery', 'passwordRecovery')
      .where('passwordRecovery.recoveryCode = :recoveryCode', { recoveryCode })
      .getOne();
  }

  async findUserByloginOrEmail(loginOrEmail: string): Promise<UserEntity> {
    return this.userTable.findOneBy([
      { email: loginOrEmail },
      { login: loginOrEmail },
    ]);
  }

  async saveUser(user: UserEntity): Promise<UserEntity> {
    return this.userTable.save(user);
  }
}
