import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class GetBannedUsersCommand {
  constructor() {}
}
@CommandHandler(GetBannedUsersCommand)
export class GetBannedUsersUseCase implements ICommand {
  constructor() {}
  async execute(command: GetBannedUsersCommand) {}
}
