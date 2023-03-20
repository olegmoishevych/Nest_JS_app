import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import { BadRequestException } from '@nestjs/common';

export class ConfirmationCommand {
  constructor(readonly code: string) {}
}

@CommandHandler(ConfirmationCommand)
export class ConfirmationUseCase implements ICommandHandler {
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute(command: ConfirmationCommand) {
    const userByCode = await this.usersRepository.findUserByCode(command.code);
    if (!userByCode)
      throw new BadRequestException([
        { message: 'User by code not found', field: 'code' },
      ]);
    if (userByCode.emailConfirmation.isConfirmed)
      throw new BadRequestException([
        {
          message: 'Code is confirmed',
          field: 'code',
        },
      ]);
    // return this.usersRepository
  }
}
