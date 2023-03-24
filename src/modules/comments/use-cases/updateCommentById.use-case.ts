import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { CommentsDto } from '../dto/comments.dto';
import { CommentsSQLRepository } from '../repository/commentsSQL.repository';

@Injectable()
export class UpdateCommentByIdCommand {
  constructor(
    readonly user: UserEntity,
    readonly commentId: string,
    dto: CommentsDto,
  ) {}
}
@CommandHandler(UpdateCommentByIdCommand)
export class UpdateCommentByIdUseCase implements ICommand {
  constructor(public commentRepo: CommentsSQLRepository) {}
  async execute(command: UpdateCommentByIdCommand) {
    const comment = await this.commentRepo.findCommentById(command.commentId);
    if (!comment)
      throw new NotFoundException({
        message: 'Comment not found',
        field: 'comment',
      });
    if (comment.commentatorInfo.userId !== command.user.id)
      throw new ForbiddenException([]);
    return this.commentsRepository.updateCommentById(
      commentId,
      userId,
      content,
    );
  }
}
