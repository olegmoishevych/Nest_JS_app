import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@Injectable()
export class GetUsersForSACommand {
  constructor() {}
}
@CommandHandler(GetUsersForSACommand)
export class GetUsersForSAUseCase implements ICommandHandler {
  constructor() {}
  async execute(command: GetUsersForSACommand) {}
}
