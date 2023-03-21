import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@Injectable()
export class DeleteBlogCommand {
  constructor() {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler {
  constructor() {}
  async execute(command: DeleteBlogCommand) {}
}
