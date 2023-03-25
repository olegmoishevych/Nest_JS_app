import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class BanUserByIdCommand {
  constructor() {}
}
@CommandHandler(BanUserByIdCommand)
export class BanUserByIdUseCase implements ICommand {
  constructor() {}
  async execute(command: BanUserByIdCommand) {}
}
