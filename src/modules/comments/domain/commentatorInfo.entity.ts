import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentsEntity } from './comments.entity';

@Entity('CommentatorInfo')
export class CommentatorInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @Column()
  userLogin: string;
  @OneToMany(() => CommentsEntity, (c) => c.commentatorInfo)
  @JoinColumn()
  comments: CommentsEntity;
}
