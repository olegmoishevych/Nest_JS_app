import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { CommentsSQLRepository } from '../repository/commentsSQL.repository';

@Injectable()
export class FindCommentByIdCommand {
  constructor(readonly id: string, readonly userId: string) {}
}
@CommandHandler(FindCommentByIdCommand)
export class FindCommentByIdUseCase implements ICommand {
  constructor(public commentsRepo: CommentsSQLRepository) {}
  async execute(command: FindCommentByIdCommand) {
    const comment = await this.commentsRepo.findCommentById(command.id);
    if (!comment) throw new NotFoundException(`Comment not found`);
    return true;
    // return this.likeStatusRepository.commentWithLikeStatus(comment, userId);
  }
}
