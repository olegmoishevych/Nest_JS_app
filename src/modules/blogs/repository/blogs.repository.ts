import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument, BlogsViewModel } from '../schemas/blogs.schema';
import { Model } from 'mongoose';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsDto } from '../dto/blogsDto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blogs.name) private readonly blogsModel: Model<BlogsDocument>,
  ) {}

  async getBlogs(
    paginationType: BlogPaginationDto,
  ): Promise<PaginationViewModel<BlogsViewModel[]>> {
    const filter = {
      name: {
        $regex: paginationType.searchNameTerm ?? '',
        $options: 'i',
      },
    };
    const findAndSortedBlogs = await this.blogsModel
      .find(filter, { _id: 0, __v: 0 })
      .sort({
        [paginationType.sortBy]:
          paginationType.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(paginationType.getSkipSize())
      .limit(paginationType.pageSize)
      .lean();
    const getCountBlogs = await this.blogsModel.countDocuments(filter);
    return new PaginationViewModel<BlogsViewModel[]>(
      getCountBlogs,
      paginationType.pageNumber,
      paginationType.pageSize,
      findAndSortedBlogs,
    );
  }

  async createBlog(blog: any): Promise<BlogsViewModel> {
    const result = await this.blogsModel.insertMany(blog);
    const { _id, __v, ...blogsCopy } = blog;
    return blogsCopy;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const result = await this.blogsModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async findBlogById(id: string): Promise<BlogsViewModel> {
    return this.blogsModel.findOne({ id }, { _id: 0, __v: 0 });
  }
  async updateBlogById(id: string, user: BlogsDto): Promise<boolean> {
    const result = await this.blogsModel.updateOne(
      { id },
      {
        $set: {
          name: user.name,
          description: user.description,
          websiteUrl: user.websiteUrl,
        },
      },
    );
    return result.matchedCount === 1;
  }
}
