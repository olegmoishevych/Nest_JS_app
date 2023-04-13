import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestionEntity } from '../domain/entites/quiz-question.entity';
import { QuizQuestionsDto } from '../../users/dto/quizQuestionsDto';

@Injectable()
export class QuizQuestionRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private quizTable: Repository<QuizQuestionEntity>,
  ) {}
  async create(dto: QuizQuestionsDto): Promise<QuizQuestionEntity> {
    const question = QuizQuestionEntity.create(dto);
    return this.quizTable.save(question);
  }
}
