import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LikeStatusEnum } from '../../../comments/schema/likeStatus.schema';
import { BlogsEntity } from '../../../blogs/domain/entities/blogs.entity';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { PostsEntity } from './posts.entity';

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
  login: string;
  @Column()
  addedAt: Date;
  @Column()
  likeStatus: LikeStatusEnum;
  @ManyToOne(() => PostsEntity, (p) => p.extendedLikesInfo, {
    // eager: true,
    // cascade: true,
    // onDelete: 'CASCADE',
  })
  // @JoinColumn()
  post: PostsEntity;
}
