import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameEntity } from './game.entity';
import { PlayerStatisticsEntity } from './player-statistics.entity';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { AnswerStatuses } from '../../types/game.types';

@Entity({ name: 'Players', orderBy: { connectedAt: 'ASC' } })
export class PlayerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, {
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  user: UserEntity;
  @Column()
  userId: number;
  @ManyToOne(() => GameEntity, { onDelete: 'CASCADE' })
  game: GameEntity;
  @Column()
  gameId: number;

  @ManyToOne(() => PlayerStatisticsEntity, (s) => s.gameParticipatingAsPlayer)
  statistics: PlayerStatisticsEntity;

  @Column({
    nullable: true,
    type: 'json',
    transformer: {
      to: (value: object[]) => JSON.stringify(value),
      from: (value: string) => {
        // because i want to date was date not string
        const answers = JSON.parse(value);
        return answers.map((answer) => ({
          ...answer,
          addedAt: new Date(answer.addedAt),
        }));
      },
    },
  })
  answers: Answer[];

  @Column()
  score: number;
  @Column()
  isFirstFinished: boolean;
  @Column()
  connectedAt: Date;

  addScore(count: number) {
    this.score += count;
  }

  isAtLeastOneAnswerIsRight(): boolean {
    return this.answers.some((a) => a.answerStatus === 'Correct');
  }

  makeFirstFinished() {
    this.isFirstFinished = true;
  }

  isFinishedAnsweringAllQuestions(): boolean {
    return this.answers.length === 5;
  }
}

export type Answer = {
  questionId: number;
  answerStatus: AnswerStatuses;
  addedAt: Date;
};
