import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { QuizQuestionsDto } from '../../../users/dto/quizQuestionsDto';
import { PublishQuestionDto } from '../../dto/publishDto';

@Entity('QuizQuestions')
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  body: string;
  @Column({
    type: 'simple-array',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    },
  })
  correctAnswers: string[];
  @Column({ default: false })
  published: boolean;
  @Column()
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;

  static create(
    dto: QuizQuestionsDto,
    correctAnswers: string[],
  ): QuizQuestionEntity {
    const question = new QuizQuestionEntity();
    question.body = dto.body;
    question.correctAnswers = correctAnswers;
    question.published = false;
    question.createdAt = new Date();
    question.updatedAt = null;
    return question;
  }
  update(dto: QuizQuestionsDto): void {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
    this.updatedAt = new Date();
  }
  updatePublished(dto: PublishQuestionDto): void {
    this.published = dto.published;
    this.updatedAt = new Date();
  }
}
