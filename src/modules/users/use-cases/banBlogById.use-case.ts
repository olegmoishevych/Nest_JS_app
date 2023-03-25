import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { BanBlogUserDto } from '../dto/userDto';
import { BlogsSqlRepository } from '../../blogs/repository/blogs.sql.repository';

@Injectable()
export class BanBlogByIdCommand {
  constructor(readonly id: string, readonly dto: BanBlogUserDto) {}
}

@CommandHandler(BanBlogByIdCommand)
export class BanBlogByIdUseCase implements ICommand {
  constructor(public blogsRepo: BlogsSqlRepository) {}

  async execute(command: BanBlogByIdCommand): Promise<boolean> {
    const blog = await this.blogsRepo.findBlogById(command.id);
    if (!blog) throw new NotFoundException([]);
    try {
      blog.banBlogById(blog, command.dto);
      await this.blogsRepo.saveBlog(blog);
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
