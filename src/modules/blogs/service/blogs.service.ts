import { Injectable, NotFoundException } from '@nestjs/common';
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

  async deleteBlogById(id: string): Promise<boolean> {
    const findBlogById = await this.blogsRepository.findBlogById(id);
    if (!findBlogById)
      throw new NotFoundException(`User with ID ${id} not found`);
    return this.blogsRepository.deleteBlogById(id);
  }

  async findBlogById(id: string): Promise<BlogsViewModel> {
    const findBlogById = await this.blogsRepository.findBlogById(id);
    if (!findBlogById)
      throw new NotFoundException(`User with ID ${id} not found`);
    return findBlogById;
  }
  async updateBlogById(id: string, user: BlogsDto): Promise<boolean> {
    const result = await this.blogsRepository.updateBlogById(id, user);
    if (!result) throw new NotFoundException(`User with ID ${id} not found`);
    return result;
  }
}