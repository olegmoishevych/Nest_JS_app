import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { NewPasswordDto } from '../dto/auth.dto';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../domain/entities/user.entity';

@Injectable()
export class NewPasswordCommand {
  constructor(readonly newPassword: NewPasswordDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase {
  constructor(public usersRepository: UsersSqlRepository) {}
  async execute(command: NewPasswordCommand): Promise<UserEntity> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.newPassword.recoveryCode,
    );
    if (!user)
      throw new NotFoundException([
        {
          message: 'RecoveryCode not found',
          field: 'recoveryCode',
        },
      ]);
    const passwordHash = await bcrypt.hash(command.newPassword.newPassword, 5);
    user.updateUserHash(passwordHash);
    return this.usersRepository.saveUser(user);
  }
}
