import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../../auth/domain/entities/user.entity';
import { BlogsEntity } from '../../../blogs/domain/entities/blogs.entity';
import { LikesEntity } from './likes.entity';
import { CreatePostDto, LikeStatusDto } from '../../dto/createPostDto';
import { CommentsEntity } from '../../../comments/domain/comments.entity';

@Entity('Posts')
export class PostsEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @ManyToOne(() => UserEntity, (u) => u.post, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;
  @Column({ default: false })
  isUserBanned: boolean;
  @Column({ default: false })
  isBlogBanned: boolean;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @ManyToOne(() => BlogsEntity, (b) => b.post, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  blog: BlogsEntity;
  @Column()
  blogId: string;
  @Column()
  blogName: string;
  @Column()
  createdAt: string;
  @OneToMany(() => LikesEntity, (l) => l.post, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  extendedLikesInfo: LikesEntity;
  @OneToMany(() => CommentsEntity, (c) => c.postInfo, {
    // eager: true,
    // cascade: true,
    // onDelete: 'CASCADE',
  })
  // @JoinColumn()
  comments: CommentsEntity;

  updatePostByBlogsAndPostsId(updatePost: CreatePostDto) {
    this.title = updatePost.title;
    this.shortDescription = updatePost.shortDescription;
    this.content = updatePost.content;
  }

  static createPost(
    user: UserEntity,
    newPostByBlogId: CreatePostDto,
    blog: BlogsEntity,
  ) {
    const post = new PostsEntity();
    post.userId = user.id;
    post.isUserBanned = false;
    post.isBlogBanned = false;
    post.title = newPostByBlogId.title;
    post.shortDescription = newPostByBlogId.shortDescription;
    post.content = newPostByBlogId.content;
    post.blogId = blog.id;
    post.blogName = blog.name;
    post.createdAt = new Date().toISOString();
    post.extendedLikesInfo = null;
    return post;
  }
}
