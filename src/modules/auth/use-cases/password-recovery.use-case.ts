import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';

@Injectable()
export class PasswordRecoveryCommand {
  constructor(readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase {
  constructor(public usersRepository: UsersSqlRepository) {}
  async execute(command: PasswordRecoveryCommand) {
    const user = await this.usersRepository.findUserByEmail(command.email);
    if (!user)
      throw new NotFoundException([
        {
          message: 'user not found',
          field: 'email',
        },
      ]);
  }
}
