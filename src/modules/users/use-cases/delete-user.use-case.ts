import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

@Injectable()
export class DeleteUserCommand {
  constructor() {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor() {}
  async execute(command: DeleteUserCommand) {}
}
