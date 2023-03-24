import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { CommentsDto } from '../dto/comments.dto';
import { CommentsSQLRepository } from '../repository/commentsSQL.repository';
import { CommentsEntity } from '../domain/comments.entity';

@Injectable()
export class UpdateCommentByIdCommand {
  constructor(
    readonly user: UserEntity,
    readonly commentId: string,
    readonly dto: CommentsDto,
  ) {}
}
@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase implements ICommand {
  constructor(public commentRepo: CommentsSQLRepository) {}
  async execute(command: UpdateCommentByIdCommand): Promise<CommentsEntity> {
    const comment = await this.commentRepo.findCommentById(command.commentId);
    if (!comment)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    if (comment.commentatorInfo.userId !== command.user.id.toString())
      throw new ForbiddenException([]);
    comment.updateComment(command.dto);
    return this.commentRepo.saveResult(comment);
  }
}
