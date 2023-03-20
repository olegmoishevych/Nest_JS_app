import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { Repository } from 'typeorm';

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

  async findUserByLogin(login: string) {
    return this.userTable.findOneBy({ login });
  }

  async findUserByEmail(email: string) {
    return this.userTable.findOneBy({ email });
  }
}
