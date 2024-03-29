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
import { CreatePostDto } from '../../dto/createPostDto';
import { CommentsEntity } from '../../../comments/domain/comments.entity';

@Entity('Posts')
export class PostsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @Column()
  blogId: string;
  @Column()
  blogName: string;
  @Column()
  createdAt: string;
  @Column({ type: 'json', nullable: true })
  extendedLikesInfo: object;
  @ManyToOne(() => UserEntity, (u) => u.post)
  @JoinColumn()
  user: UserEntity; // user (owner)
  @ManyToOne(() => BlogsEntity, (b) => b.post)
  @JoinColumn()
  blog: BlogsEntity; // blog (owner)
  @OneToMany(() => LikesEntity, (l) => l.post, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  likes: LikesEntity; // posts (owner)
  @OneToMany(() => CommentsEntity, (c) => c.postInfo, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  comments: CommentsEntity; // posts (owner)

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
    post.user = user;
    post.userId = user.id;
    post.title = newPostByBlogId.title;
    post.shortDescription = newPostByBlogId.shortDescription;
    post.content = newPostByBlogId.content;
    post.blogId = blog.id;
    post.blogName = blog.name;
    post.createdAt = new Date().toISOString();
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };

    return post;
  }
}
