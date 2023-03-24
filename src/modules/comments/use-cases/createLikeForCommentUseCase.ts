import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';

@Injectable()
export class CreateLikeForCommentComamnd {
  constructor() {}
}
@CommandHandler(CreateLikeForCommentComamnd)
export class CreateLikeForCommentUseCase implements ICommand {
  constructor() {}
  async execute(command: CreateLikeForCommentComamnd) {}
}
