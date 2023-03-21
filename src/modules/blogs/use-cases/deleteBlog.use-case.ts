import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';

@Injectable()
export class DeleteBlogCommand {
  constructor(readonly id: string, readonly userId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler {
  constructor(public blogsRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogCommand) {}
}
