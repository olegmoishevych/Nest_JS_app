import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../repository/quiz-question.repository';
import { DeleteResult } from 'typeorm';

@Injectable()
export class DeleteQuestionByIdCommand {
  constructor(readonly id: string) {}
}
@CommandHandler(DeleteQuestionByIdCommand)
export class DeleteQuestionByIdUseCase implements ICommand {
  constructor(public quizRepo: QuizQuestionRepository) {}
  async execute({ id }: DeleteQuestionByIdCommand): Promise<DeleteResult> {
    const question = await this.quizRepo.findQuestionById(id);
    if (!question) throw new NotFoundException([]);
    return this.quizRepo.deleteQuestionById(id);
  }
}
