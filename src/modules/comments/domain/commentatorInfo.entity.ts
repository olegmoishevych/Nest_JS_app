import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommentsEntity } from './comments.entity';

@Entity('CommentatorInfo')
export class CommentatorInfoEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  userId: string;
  @Column()
  userLogin: string;
  @OneToMany(() => CommentsEntity, (c) => c.commentatorInfo, {
    onDelete: 'CASCADE',
  })
  comments: CommentsEntity;
}
