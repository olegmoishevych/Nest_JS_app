import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  correctAnswers: [string];
  @Column({ default: false })
  published: boolean;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
}
