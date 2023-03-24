import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class GetCommentsForAllPostsCommand {
  constructor() {}
}
@CommandHandler(GetCommentsForAllPostsCommand)
export class GetCommentsForAllPostsUseCase implements ICommand {
  constructor() {}
  async execute(command: GetCommentsForAllPostsCommand) {}
}
