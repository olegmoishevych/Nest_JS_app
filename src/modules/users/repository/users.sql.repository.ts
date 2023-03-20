import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectRepository(UserEntity) private userTable: Repository<UserEntity>,
  ) {}

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
