import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class FindPostByIdCommand {
  constructor() {}
}

@CommandHandler(FindPostByIdCommand)
export class FindPostByIdUseCase implements ICommand {
  constructor() {}
  async execute(command: FindPostByIdCommand) {}
}
