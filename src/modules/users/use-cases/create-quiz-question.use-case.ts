import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { QuizQuestionsDto } from '../dto/quizQuestionsDto';
import { QuizQuestionRepository } from '../../quiz/repository/quiz-question.repository';

@Injectable()
export class CreateQuizQuestionCommand {
  constructor(readonly dto: QuizQuestionsDto) {}
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionUseCase implements ICommand {
  constructor(public readonly quizRepo: QuizQuestionRepository) {}

  async execute({ dto }: CreateQuizQuestionCommand) {
    const question = await this.quizRepo.create(dto);
    return {
      id: question.id,
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt ? question.updatedAt : null,
    };
  }
}
