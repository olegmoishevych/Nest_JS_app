import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { QuizQuestionEntity } from '../domain/entites/quiz-question.entity';
import { QuizQuestionsDto } from '../../users/dto/quizQuestionsDto';
import { QuizQuestionsPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class QuizQuestionRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private quizTable: Repository<QuizQuestionEntity>,
  ) {}

  async create(dto: QuizQuestionsDto): Promise<QuizQuestionEntity> {
    const question = QuizQuestionEntity.create(dto, dto.correctAnswers);
    return this.quizTable.save(question);
  }

  async getRandomQuestionsForStartGame(): Promise<QuizQuestionEntity[]> {
    return this.quizTable
      .createQueryBuilder('q')
      .select()
      .where('q.published = true')
      .orderBy('RANDOM()')
      .take(5)
      .getMany();
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

  async findAllQuestions(
    dto: QuizQuestionsPaginationDto,
  ): Promise<PaginationViewModel<QuizQuestionEntity[]>> {
    const {
      bodySearchTerm,
      publishedStatus,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    } = dto;

    const where = {
      ...(bodySearchTerm && { body: ILike(`%${bodySearchTerm}%`) }),
      ...(publishedStatus !== 'all' && {
        published: publishedStatus === 'published',
      }),
    };

    const order = { [sortBy]: sortDirection };
    const [items, totalCount] = await this.quizTable.findAndCount({
      where,
      order,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: [...items],
    };
  }
}
