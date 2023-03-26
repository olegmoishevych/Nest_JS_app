import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { BlogsEntity } from '../domain/entities/blogs.entity';
import { UserEntity } from '../../auth/domain/entities/user.entity';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectRepository(BlogsEntity)
    private blogsTable: Repository<BlogsEntity>,
  ) {}

  async createBlog(
    user: UserEntity,
    id: string,
    login: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<BlogsEntity> {
    const newBlog = BlogsEntity.create(
      user,
      id,
      login,
      name,
      description,
      websiteUrl,
    );
    return this.blogsTable.save(newBlog);
  }

  async findBlogById(id: string): Promise<BlogsEntity> {
    return this.blogsTable.findOneBy({ id });
  }

  async deleteBlogById(id: string): Promise<DeleteResult> {
    return this.blogsTable.delete(id);
  }

  async saveBlog(blog: BlogsEntity): Promise<BlogsEntity> {
    return this.blogsTable.save(blog);
  }
}
