import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class BanBlogByIdCommand {
  constructor() {}
}
@CommandHandler(BanBlogByIdCommand)
export class BanBlogByIdUseCase implements ICommand {
  constructor() {}
  async execute(command: BanBlogByIdCommand) {}
}
