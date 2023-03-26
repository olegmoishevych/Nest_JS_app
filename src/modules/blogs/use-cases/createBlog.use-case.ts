import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsDto } from '../dto/blogsDto';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { BlogsViewModel } from '../schemas/blogs.schema';
import { UserEntity } from '../../auth/domain/entities/user.entity';

@Injectable()
export class CreateBlogCommand {
  constructor(readonly createBlogType: BlogsDto, readonly user: UserEntity) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler {
  constructor(private blogsRepository: BlogsSqlRepository) {}

  async execute(command: CreateBlogCommand): Promise<BlogsViewModel> {
    const blog = await this.blogsRepository.createBlog(
      command.user,
      command.user.id,
      command.user.login,
      command.createBlogType.name,
      command.createBlogType.description,
      command.createBlogType.websiteUrl,
    );
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
