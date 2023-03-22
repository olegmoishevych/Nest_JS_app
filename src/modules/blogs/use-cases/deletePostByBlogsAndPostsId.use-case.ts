import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { PostsSQLRepository } from '../../posts/repository/postsSQL.repository';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { DeleteResult } from 'typeorm';

@Injectable()
export class DeletePostByBlogsAndPostsIdCommand {
  constructor(
    readonly blogId: string,
    readonly postId: string,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(DeletePostByBlogsAndPostsIdCommand)
export class DeletePostByBlogsAndPostsIdUseCase implements ICommandHandler {
  constructor(
    public postsRepo: PostsSQLRepository,
    public blogsRepo: BlogsSqlRepository,
  ) {}

  async execute(
    command: DeletePostByBlogsAndPostsIdCommand,
  ): Promise<DeleteResult> {
    const blog = await this.blogsRepo.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException([]);
    const post = await this.postsRepo.findPostById(command.postId);
    if (!post) throw new NotFoundException([]);
    if (blog.blogOwnerInfo.id !== command.user.id)
      throw new ForbiddenException([]);
    return this.postsRepo.deletePostById(command.postId, command.user.id);
  }
}
