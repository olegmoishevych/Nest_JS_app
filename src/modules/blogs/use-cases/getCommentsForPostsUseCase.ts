import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class GetCommentsForPostsCommand {
  constructor() {}
}
@CommandHandler(GetCommentsForPostsCommand)
export class GetCommentsForPostsUseCase implements ICommand {
  constructor() {}
  async execute(command: GetCommentsForPostsCommand) {}
}
