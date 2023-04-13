import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsDto } from '../dto/quizQuestionsDto';
import { QuizQuestionRepository } from '../../quiz/repository/quiz-question.repository';
import { QuizQuestionEntity } from '../../quiz/domain/entites/quiz-question.entity';

@Injectable()
export class CreateQuizQuestionCommand {
  constructor(readonly dto: QuizQuestionsDto) {}
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionUseCase {
  constructor(public readonly quizRepo: QuizQuestionRepository) {}

  async execute({
    dto,
  }: CreateQuizQuestionCommand): Promise<QuizQuestionEntity> {
    return this.quizRepo.create(dto);
  }
}
