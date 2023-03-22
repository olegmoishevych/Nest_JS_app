import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from '../domain/entities/posts.entity';
import { Repository } from 'typeorm';
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
}
