import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class FindBannedUsersCommand {
  constructor() {}
}
@CommandHandler(FindBannedUsersCommand)
export class FindBannedUsersUseCase implements ICommand {
  constructor() {}
  async execute(command: FindBannedUsersCommand) {}
}
