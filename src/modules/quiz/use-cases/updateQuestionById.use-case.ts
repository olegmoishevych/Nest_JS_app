import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { QuizQuestionsDto } from '../../users/dto/quizQuestionsDto';
import { QuizQuestionRepository } from '../repository/quiz-question.repository';
import { QuizQuestionEntity } from '../domain/entites/quiz-question.entity';

@Injectable()
export class UpdateQuestionByIdCommand {
  constructor(readonly dto: QuizQuestionsDto, readonly id: string) {}
}
@CommandHandler(UpdateQuestionByIdCommand)
export class UpdateQuestionByIdUseCase implements ICommand {
  constructor(public quizRepo: QuizQuestionRepository) {}
  async execute({
    id,
    dto,
  }: UpdateQuestionByIdCommand): Promise<QuizQuestionEntity> {
    const question = await this.quizRepo.findQuestionById(id);
    if (!question) throw new NotFoundException([]);
    question.update(dto);
    return this.quizRepo.save(question);
  }
}
