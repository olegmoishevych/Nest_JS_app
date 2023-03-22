import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@Injectable()
export class DeletePostByBlogsAndPostsIdCommand {
  constructor() {}
}
@CommandHandler(DeletePostByBlogsAndPostsIdCommand)
export class DeletePostByBlogsAndPostsIdUseCase implements ICommandHandler {
  constructor() {}
  async execute(command: any) {}
}
