import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PostsQuerySqlRepository } from '../repository/postsQuerySql.repository';

@Injectable()
export class FindPostsCommand {
  constructor(readonly userId: string, readonly dto: PaginationDto) {}
}
@CommandHandler(FindPostsCommand)
export class FindPostsUseCase implements ICommand {
  constructor(public postsRepo: PostsQuerySqlRepository) {}

  async execute(command: FindPostsCommand) {
    const posts = await this.postsRepo.findPosts(command.userId, command.dto);
    return posts;
  }
}
