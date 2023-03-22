import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { BlogsViewModel } from '../schemas/blogs.schema';

@Injectable()
export class FindBlogByIdCommand {
  constructor(readonly id: string) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase implements ICommandHandler {
  constructor(private blogsRepository: BlogsSqlRepository) {}
  async execute(command: FindBlogByIdCommand) {
    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog)
      throw new NotFoundException([
        { message: 'Blog not found', field: 'Blog' },
      ]);
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
