import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogsEntity } from '../../../blogs/domain/entities/blogs.entity';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { PostsEntity } from './posts.entity';
import { CommentsEntity } from '../../../comments/domain/comments.entity';

export type LikeStatuses = 'Like' | 'Dislike' | 'None';

@Entity('Likes')
export class LikesEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  parentId: string;
  @Column({ default: false })
  isUserBanned: boolean;
  @ManyToOne(() => BlogsEntity, (b) => b.post, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;
  @Column()
  userLogin: string;
  @Column()
  addedAt: string;
  @Column()
  likeStatus: string;
  @ManyToOne(() => PostsEntity, (p) => p.extendedLikesInfo, {
    // eager: true,
    // cascade: true,
    // onDelete: 'CASCADE',
  })
  // @JoinColumn()
  post: PostsEntity;
  @ManyToOne(() => CommentsEntity, (c) => c.likesInfo, {
    // eager: true,
    // cascade: true,
    // onDelete: 'CASCADE',
  })
  // @JoinColumn()
  comments: CommentsEntity;
}
