import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument, BlogsViewModel } from '../schemas/blogs.schema';
import { Model } from 'mongoose';
import { BlogPaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsDto, BlogsModal_For_DB } from '../dto/blogsDto';

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
      .find(filter, { _id: 0, __v: 0, blogOwnerInfo: 0 })
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

  async createBlog(blog: BlogsModal_For_DB): Promise<BlogsViewModel> {
    await this.blogsModel.create({ ...blog });
    const { blogOwnerInfo, ...blogCopy } = blog;
    return blogCopy;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const result = await this.blogsModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async findBlogById(id: string): Promise<BlogsModal_For_DB> {
    return this.blogsModel.findOne({ id }, { _id: 0, __v: 0 });
  }

  async updateBlogById(
    id: string,
    user: BlogsDto,
    userId: string,
  ): Promise<boolean> {
    return this.blogsModel.findOneAndUpdate(
      { id, 'blogOwnerInfo.userId': userId },
      {
        $set: {
          name: user.name,
          description: user.description,
          websiteUrl: user.websiteUrl,
        },
      },
    );
  }
}
