import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class FindPostsCommand {
  constructor() {}
}
@CommandHandler(FindPostsCommand)
export class FindPostsUseCase implements ICommand {
  constructor() {}
  async execute(command: FindPostsCommand) {}
}
