import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { PostsSQLRepository } from '../repository/postsSQL.repository';
import { PostsQuerySqlRepository } from '../repository/postsQuerySql.repository';

@Injectable()
export class FindPostByIdCommand {
  constructor(readonly userId: string | null, readonly id: string) {}
}

@CommandHandler(FindPostByIdCommand)
export class FindPostByIdUseCase implements ICommand {
  constructor(
    public postsRepo: PostsSQLRepository,
    public postsQueryRepo: PostsQuerySqlRepository,
  ) {}

  async execute(command: FindPostByIdCommand) {
    const post = await this.postsRepo.findPostById(command.id);
    if (!post) throw new NotFoundException(`Post not found`);
    return this.postsQueryRepo.postWithLikeStatus(post, command.userId);
  }
}
