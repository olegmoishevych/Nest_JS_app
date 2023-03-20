import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

@Injectable()
export class LogoutCommand {
  constructor() {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase {
  constructor() {}
  async execute(command: LogoutCommand) {}
}
