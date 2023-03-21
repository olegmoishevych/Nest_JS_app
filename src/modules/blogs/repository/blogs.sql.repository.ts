import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsEntity } from '../domain/entities/blogs.entity';

@Injectable()
export class BlogsSqlRepository {
  constructor(
    @InjectRepository(BlogsEntity) private blogsTable: Repository<BlogsEntity>,
  ) {}
  async createBlog(
    id: string,
    login: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<BlogsEntity> {
    const newBlog = BlogsEntity.create(
      id,
      login,
      name,
      description,
      websiteUrl,
    );
    return this.blogsTable.save(newBlog);
  }
}
