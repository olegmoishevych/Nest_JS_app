import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument, BlogsViewModel } from '../schemas/blogs.schema';
import { Model } from 'mongoose';
import { BlogsRepository } from '../repository/blogs.repository';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { BlogsDto } from '../dto/blogs.dto';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    @InjectModel(Blogs.name) private blogsModel: Model<BlogsDocument>,
  ) {}

  async getBlogs(paginationType: PaginationDto) {
    return this.blogsRepository.getBlogs(paginationType);
  }

  async createBlog(blog: BlogsDto): Promise<BlogsViewModel> {
    return this.blogsRepository.createBlog(blog);
    // return this.blogsRepository.createBlog(newBlog);
  }
  //
  // async getBlogById(id: string): Promise<BlogsType | null> {
  //   return this.blogsRepository.getBlogById(id);
  // }
  //
  // async updateBlogById(
  //   id: string,
  //   name: string,
  //   description: string,
  //   websiteUrl: string,
  // ): Promise<boolean> {
  //   return this.blogsRepository.updateBlogById(
  //     id,
  //     name,
  //     description,
  //     websiteUrl,
  //   );
  // }
  //
  // async deleteBlog(id: string): Promise<boolean> {
  //   return this.blogsRepository.deleteBlog(id);
  // }
}
