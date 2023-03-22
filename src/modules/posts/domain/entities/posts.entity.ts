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
import { LikesEntity } from './likesEntity.entity';
import { CreatePostDto } from '../../dto/createPostDto';

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

  static createPost(
    user: UserEntity,
    newPostByBlogId: CreatePostDto,
    blog: BlogsEntity,
  ) {
    // const likes = new LikesEntity();
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
    // post.extendedLikesInfo = likes;
    return post;
  }
}
