import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentatorInfoEntity } from './commentatorInfo.entity';
import { LikesEntity } from '../../posts/domain/entities/likes.entity';
import { PostsEntity } from '../../posts/domain/entities/posts.entity';

@Entity('Comments')
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  isUserBanned: boolean;
  @Column()
  content: string;
  @Column()
  postId: string;
  @ManyToOne(() => CommentatorInfoEntity, (c) => c.comments, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  commentatorInfo: CommentatorInfoEntity;
  @Column()
  createdAt: string;
  @OneToMany(() => LikesEntity, (l) => l.comments, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  likesInfo: LikesEntity;
  @ManyToOne(() => PostsEntity, (p) => p.comments, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  postInfo: PostsEntity;
}
