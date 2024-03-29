import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { DeleteResult } from 'typeorm';

@Injectable()
export class DeleteBlogCommand {
  constructor(readonly id: string, readonly userId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler {
  constructor(public blogsRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogCommand): Promise<DeleteResult> {
    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog) throw new NotFoundException(`Blog not found`);
    if (blog.blogOwnerInfo.id !== command.userId)
      throw new ForbiddenException([]);
    return this.blogsRepository.deleteBlogById(command.id);
  }
}
