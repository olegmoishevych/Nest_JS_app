import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsSqlRepository } from '../repository/blogs.sql.repository';
import { PostsQuerySqlRepository } from '../../posts/repository/postsQuerySql.repository';
import { PostsViewModal } from '../../posts/schemas/posts.schema';

@Injectable()
export class FindPostsByBlogIdCommand {
  constructor(
    readonly blogId: string,
    readonly dto: PaginationDto,
    readonly userId: string,
  ) {}
}

@CommandHandler(FindPostsByBlogIdCommand)
export class FindPostsByBlogIdUseCase implements ICommand {
  constructor(
    public blogsRepo: BlogsSqlRepository,
    public postsQueryRepo: PostsQuerySqlRepository,
  ) {}

  async execute(
    command: FindPostsByBlogIdCommand,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    const blog = await this.blogsRepo.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    const findAndSortedPosts = await this.postsQueryRepo.findPostsByBlogId(
      command.blogId,
      command.dto,
    );
    const postsWithLikesStatus = await this.postsQueryRepo.postsWithLikeStatus(
      findAndSortedPosts.items,
      command.userId,
    );
    const postsCountByBlogId = await this.postsQueryRepo.getCountCollection(
      command.blogId,
    );
    return new PaginationViewModel<PostsViewModal[]>(
      postsCountByBlogId,
      command.dto.pageNumber,
      command.dto.pageSize,
      postsWithLikesStatus,
    );
  }
}
