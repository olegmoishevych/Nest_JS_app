import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
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

  async deleteQuestionById(id: string): Promise<DeleteResult> {
    return this.quizTable.delete({ id });
  }
  async findQuestionById(id: string): Promise<QuizQuestionEntity> {
    return this.quizTable.findOneBy({ id });
  }
  async save(question: QuizQuestionEntity): Promise<QuizQuestionEntity> {
    return this.quizTable.save(question);
  }
}
