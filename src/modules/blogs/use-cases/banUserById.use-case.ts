import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@Injectable()
export class BanUserByIdCommand {
  constructor() {}
}

@CommandHandler(BanUserByIdCommand)
export class BanUserByIdUseCase implements ICommandHandler {
  constructor() {}
  async execute(command: BanUserByIdCommand) {}
}
