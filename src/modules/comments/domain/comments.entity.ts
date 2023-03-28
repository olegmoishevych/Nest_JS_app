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
import { CommentsDto } from '../dto/comments.dto';
import { UserEntity } from '../../auth/domain/entities/user.entity';

@Entity('Comments')
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  content: string;
  @Column()
  postId: string;
  @Column()
  createdAt: string;
  @Column({ type: 'json', nullable: true })
  likesInfo: object;
  @OneToMany(() => LikesEntity, (l) => l.comments, { cascade: true })
  likes: LikesEntity[];
  @ManyToOne(() => UserEntity, (u) => u.comment, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  @ManyToOne(() => CommentatorInfoEntity, (c) => c.comments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  commentatorInfo: CommentatorInfoEntity;
  @ManyToOne(() => PostsEntity, (p) => p.comments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  postInfo: PostsEntity;

  updateComment(dto: CommentsDto): void {
    this.content = dto.content;
  }
  static createCommentByPostId(
    post: PostsEntity,
    dto: CommentsDto,
    user: UserEntity,
  ): CommentsEntity {
    const commentatorInfo = new CommentatorInfoEntity();
    commentatorInfo.userId = user.id;
    commentatorInfo.userLogin = user.login;

    const postInfo = new PostsEntity();
    postInfo.id = post.id;
    postInfo.title = post.title;
    postInfo.blogId = post.blogId;
    postInfo.blogName = post.blogName;

    const commentForDB = new CommentsEntity();
    commentForDB.user = user;
    commentForDB.postId = post.id;
    commentForDB.content = dto.content;
    commentForDB.commentatorInfo = commentatorInfo;
    commentForDB.createdAt = new Date().toISOString();
    commentForDB.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };
    commentForDB.postInfo = postInfo;
    return commentForDB;
  }
}
