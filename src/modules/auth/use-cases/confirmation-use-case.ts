import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export class ConfirmationCommand {
  constructor(readonly code: string) {}
}

@CommandHandler(ConfirmationCommand)
export class ConfirmationUseCase implements ICommandHandler {
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute(command: ConfirmationCommand): Promise<boolean> {
    const userByCode = await this.usersRepository.findUserByCode(command.code);
    if (!userByCode)
      throw new BadRequestException([
        { message: 'User by code not found', field: 'code' },
      ]);
    try {
      userByCode.confirmedCode(command.code);
      await this.usersRepository.saveUser(userByCode);
      return true;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
