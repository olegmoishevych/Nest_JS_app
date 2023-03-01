import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument, BlogsViewModel } from '../schemas/blogs.schema';
import { BlogsRepository } from '../repository/blogs.repository';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { BlogsDto, DB_BlogsType } from '../dto/blogsDto';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    @InjectModel(Blogs.name) private blogsModel: Model<BlogsDocument>,
  ) {}

  async getBlogs(
    paginationType: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    return this.blogsRepository.getBlogs(paginationType);
  }

  async createBlog(blog: BlogsDto): Promise<BlogsViewModel> {
    const newBlog: DB_BlogsType = {
      id: new ObjectId().toString(),
      // _id: new ObjectId(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    return this.blogsRepository.createBlog(newBlog);
  }

  async deleteBlogById(id: string) {
    // return this.blogsRepository.deleteBlog(id);
  }

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
}
