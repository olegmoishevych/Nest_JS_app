import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { QuizQuestionRepository } from '../repository/quiz-question.repository';
import { QuizQuestionEntity } from '../domain/entites/quiz-question.entity';
import { PublishQuestionDto } from '../dto/publishDto';

@Injectable()
export class UpdatePublishCommand {
  constructor(readonly id: string, readonly dto: PublishQuestionDto) {}
}

@CommandHandler(UpdatePublishCommand)
export class UpdatePublishUseCase implements ICommand {
  constructor(public quizRepo: QuizQuestionRepository) {}

  async execute({
    dto,
    id,
  }: UpdatePublishCommand): Promise<QuizQuestionEntity> {
    const question = await this.quizRepo.findQuestionById(id);
    if (!question) throw new NotFoundException([]);
    question.updatePublished(dto);
    return this.quizRepo.save(question);
  }
}
