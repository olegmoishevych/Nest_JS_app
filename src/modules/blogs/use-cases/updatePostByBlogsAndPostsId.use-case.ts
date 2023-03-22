import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@Injectable()
export class UpdatePostByBlogsAndPostsIdCommand {
  constructor() {}
}

@CommandHandler(UpdatePostByBlogsAndPostsIdCommand)
export class UpdatePostByBlogsAndPostsIdUseCase implements ICommandHandler {
  constructor() {}
  async execute(command: any) {}
}
