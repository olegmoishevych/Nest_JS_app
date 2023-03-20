import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/repository/users.repository';

export class ConfirmationCommand {
  constructor(readonly code: string) {}
}

@CommandHandler(ConfirmationCommand)
export class ConfirmationUseCase implements ICommandHandler {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: any) {}
}
