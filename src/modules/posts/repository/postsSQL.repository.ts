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
    return this.postsTable.findOneBy({ id });
  }
  async save(post: PostsEntity): Promise<PostsEntity> {
    return this.postsTable.save(post);
  }
  async deletePostById(id: string, userId: string): Promise<DeleteResult> {
    return this.postsTable.delete({ id: id, userId: userId });
  }
}
