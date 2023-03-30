import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../domain/entities/posts.entity';
import { DeleteResult, Repository } from 'typeorm';
import { UserEntity } from '../../auth/domain/entities/user.entity';
import { BlogsEntity } from '../../blogs/domain/entities/blogs.entity';
import { CreatePostDto } from '../dto/createPostDto';

@Injectable()
export class PostsSQLRepository {
  constructor(
    @InjectRepository(PostsEntity)
    private postsTable: Repository<PostsEntity>,
  ) {}

  async savePost(
    user: UserEntity,
    blog: BlogsEntity,
    newPostByBlogId: CreatePostDto,
  ): Promise<PostsEntity> {
    const newPost = PostsEntity.createPost(user, newPostByBlogId, blog);
    return this.postsTable.save(newPost);
  }

  async findPostById(id: string): Promise<PostsEntity> {
    return this.postsTable
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('blog.banInfo', 'blogBanInfo')
      .leftJoinAndSelect('user.banInfo', 'userBanInfo')
      .where('post.id = :id', { id })
      .andWhere('userBanInfo.isBanned = false')
      .andWhere('blogBanInfo.isBlogBanned = false')
      .getOne();
  }

  async findPostByBlogId(blogId: string): Promise<PostsEntity> {
    return this.postsTable
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('blog.banInfo', 'blogBanInfo')
      .leftJoinAndSelect('user.banInfo', 'userBanInfo')
      .where('post.blogId = :blogId', { blogId: blogId })
      .andWhere('userBanInfo.isBanned = false')
      .andWhere('blogBanInfo.isBlogBanned = false')
      .getOne();
  }

  async saveResult(post: PostsEntity): Promise<PostsEntity> {
    return this.postsTable.save(post);
  }

  async deletePostById(id: string, userId: string): Promise<DeleteResult> {
    return this.postsTable.delete({ id: id, userId: userId });
  }
}
