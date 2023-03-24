import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { PostsSQLRepository } from '../repository/postsSQL.repository';
import { CommentsSQLqueryRepository } from '../../comments/repository/commentsSQLquery.repository';
import { CommentsViewModal } from '../../comments/schema/comments.schema';

@Injectable()
export class FindCommentsByPostIdCommand {
  constructor(
    readonly postId: string,
    readonly userId: string | null,
    readonly dto: PaginationDto,
  ) {}
}

@CommandHandler(FindCommentsByPostIdCommand)
export class FindCommentsByPostIdUseCase implements ICommand {
  constructor(
    public postsRepo: PostsSQLRepository,
    public commentsQueryRepo: CommentsSQLqueryRepository,
  ) {}

  async execute(
    command: FindCommentsByPostIdCommand,
  ): Promise<PaginationViewModel<CommentsViewModal[]>> {
    const post = await this.postsRepo.findPostById(command.postId);
    if (!post) throw new NotFoundException(`Post not found`);
    const findAndSortedComments =
      await this.commentsQueryRepo.findCommentsByPostId(
        command.postId,
        command.dto,
      );
    const commentsWithLikeStatus =
      await this.commentsQueryRepo.commentsWithLikeStatus(
        findAndSortedComments.items,
        command.userId,
      );
    const getCount = await this.commentsQueryRepo.getCountCollection(
      command.postId,
    );
    return new PaginationViewModel<any>(
      getCount,
      command.dto.pageNumber,
      command.dto.pageSize,
      commentsWithLikeStatus,
    );
  }
}
