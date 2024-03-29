import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { CommentsSQLRepository } from '../repository/commentsSQL.repository';
import { CommentsSQLqueryRepository } from '../repository/commentsSQLquery.repository';
import { CommentsViewModal } from '../schema/comments.schema';

@Injectable()
export class FindCommentByIdCommand {
  constructor(readonly id: string, readonly userId: string) {}
}

@CommandHandler(FindCommentByIdCommand)
export class FindCommentByIdUseCase implements ICommand {
  constructor(
    public commentsRepo: CommentsSQLRepository,
    public commentsQueryRepo: CommentsSQLqueryRepository,
  ) {}

  async execute(command: FindCommentByIdCommand) {
    const comment: any = await this.commentsRepo.findCommentById(command.id);
    if (!comment) throw new NotFoundException(`Comment not found`);
    const commentWithLikes = await this.commentsQueryRepo.commentWithLikeStatus(
      comment,
      command.userId,
    );
    return {
      id: commentWithLikes.id,
      content: commentWithLikes.content,
      commentatorInfo: {
        userId: commentWithLikes.user.id,
        userLogin: commentWithLikes.user.login,
      },
      createdAt: commentWithLikes.createdAt,
      likesInfo: {
        likesCount: commentWithLikes.likesInfo.likesCount,
        dislikesCount: commentWithLikes.likesInfo.dislikesCount,
        myStatus: commentWithLikes.likesInfo.myStatus,
      },
    };
  }
}
