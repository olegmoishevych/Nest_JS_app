import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { LikeStatusDto } from '../dto/likeStatus.dto';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { CommentsSQLRepository } from '../repository/commentsSQL.repository';
import { LikeStatusSQLRepository } from '../../posts/repository/likeStatusSQL.repository';
import { LikesEntity } from '../../posts/domain/entities/likes.entity';

@Injectable()
export class CreateLikeForCommentCommand {
  constructor(
    readonly commentId: string,
    readonly dto: LikeStatusDto,
    readonly user: UserEntity,
  ) {}
}
@CommandHandler(CreateLikeForCommentCommand)
export class CreateLikeForCommentUseCase implements ICommand {
  constructor(
    public commentsRepo: CommentsSQLRepository,
    public likesStatusRepo: LikeStatusSQLRepository,
  ) {}
  async execute(command: CreateLikeForCommentCommand): Promise<LikesEntity> {
    const comment = await this.commentsRepo.findCommentById(command.commentId);
    if (!comment)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    const like = await this.likesStatusRepo.findLikeForUser(
      command.user.id,
      command.commentId,
    );
    if (!like) {
      return this.likesStatusRepo.createLikeStatusByCommentId(
        command.commentId,
        command.user,
        command.dto,
      );
    }
    if (like && like.likeStatus !== command.dto.likeStatus) {
      like.likeStatus = command.dto.likeStatus;
      await this.likesStatusRepo.saveResult(like);
    }
  }
}
