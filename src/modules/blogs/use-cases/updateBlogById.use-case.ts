import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { BlogsDto } from '../dto/blogsDto';
import { BlogsEntity } from '../domain/entities/blogs.entity';

@Injectable()
export class UpdateBlogByIdCommand {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly updateBlogType: BlogsDto,
  ) {}
}

@CommandHandler(UpdateBlogByIdCommand)
export class UpdateBlogByIdUseCase implements ICommandHandler {
  constructor(public blogsRepository: BlogsSqlRepository) {}
  async execute(command: UpdateBlogByIdCommand): Promise<BlogsEntity> {
    const blog = await this.blogsRepository.findBlogById(command.id);
    if (!blog)
      throw new NotFoundException([
        {
          message: 'Blog not found',
          field: 'Blog',
        },
      ]);
    if (blog.blogOwnerInfo.id !== command.userId)
      throw new ForbiddenException([
        {
          message: 'Its not your blog',
          field: 'user',
        },
      ]);
    blog.updateBlog(command.updateBlogType);
    return this.blogsRepository.saveBlog(blog);
  }
}
