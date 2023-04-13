import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { QuizQuestionsDto } from '../../../users/dto/quizQuestionsDto';

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
  @Column()
  updatedAt: Date;

  static create(dto: QuizQuestionsDto): QuizQuestionEntity {
    const question = new QuizQuestionEntity();
    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;
    question.createdAt = new Date();
    question.updatedAt = new Date();
    return question;
  }
  update(dto: QuizQuestionsDto): void {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
  }
}
