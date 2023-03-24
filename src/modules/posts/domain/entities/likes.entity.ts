import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { PostsEntity } from './posts.entity';
import { CommentsEntity } from '../../../comments/domain/comments.entity';
import { LikeStatusDto } from '../../dto/createPostDto';

export type LikeStatuses = 'Like' | 'Dislike' | 'None';

@Entity('Likes')
export class LikesEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  parentId: string;
  @Column({ default: false })
  isUserBanned: boolean;
  @Column()
  userId: string;
  @Column()
  login: string;
  @Column()
  addedAt: string;
  @Column()
  likeStatus: string;
  @ManyToOne(() => PostsEntity, (p) => p.likes, {})
  post: PostsEntity;
  @ManyToOne(() => CommentsEntity, (c) => c.likesInfo, {})
  comments: CommentsEntity;

  static createLikeForPost(
    postId: string,
    user: UserEntity,
    dto: LikeStatusDto,
  ): LikesEntity {
    const likeForDb = new LikesEntity();
    likeForDb.parentId = postId;
    likeForDb.userId = user.id;
    likeForDb.login = user.login;
    likeForDb.isUserBanned = false;
    likeForDb.likeStatus = dto.likeStatus;
    likeForDb.addedAt = new Date().toISOString();
    return likeForDb;
  }
  static createLikeForComment(
    commentId: string,
    user: UserEntity,
    dto: LikeStatusDto,
  ): LikesEntity {
    const likeForComment = new LikesEntity();
    likeForComment.parentId = commentId;
    likeForComment.isUserBanned = false;
    likeForComment.userId = user.id;
    likeForComment.login = user.login;
    likeForComment.likeStatus = dto.likeStatus;
    likeForComment.addedAt = new Date().toISOString();
    return likeForComment;
  }
}
