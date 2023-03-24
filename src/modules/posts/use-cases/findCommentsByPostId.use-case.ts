import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class FindCommentsByPostIdCommand {
  constructor() {}
}
@CommandHandler(FindCommentsByPostIdCommand)
export class FindCommentsByPostIdUseCase implements ICommand {
  constructor() {}
  async execute(command: FindCommentsByPostIdCommand) {}
}
