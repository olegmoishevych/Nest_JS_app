import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { CommentsSQLRepository } from '../repository/commentsSQL.repository';
import { DeleteResult } from 'typeorm';

@Injectable()
export class DeleteCommentByIdCommand {
  constructor(readonly user: UserEntity, readonly commentId: string) {}
}
@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdUseCase implements ICommand {
  constructor(public commentRepo: CommentsSQLRepository) {}
  async execute(command: DeleteCommentByIdCommand): Promise<DeleteResult> {
    const comment = await this.commentRepo.findCommentById(command.commentId);
    if (!comment)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    if (comment.commentatorInfo.userId !== command.user.id.toString())
      throw new ForbiddenException([]);
    return this.commentRepo.deleteCommentById(command.commentId);
  }
}
