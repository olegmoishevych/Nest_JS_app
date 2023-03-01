import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blogs, BlogsDocument, BlogsViewModel } from '../schemas/blogs.schema';
import { Model } from 'mongoose';
import { paginator } from '../../helpers/pagination';
import { PaginationDto } from '../../helpers/dto/pagination.dto';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blogs.name) private readonly blogsModel: Model<BlogsDocument>,
  ) {}

  async getBlogs(paginationType: PaginationDto) {
    const findAndSortedBlogs = await this.blogsModel
      .find(
        {
          name: {
            $regex: paginationType.searchNameTerm,
            $options: 'i',
          },
        },
        { _id: 0, __v: 0 },
      )
      .sort({
        [paginationType.sortBy as any]: paginationType.sortDirection as any,
      })
      .skip((+paginationType.pageNumber - 1) * +paginationType.pageSize)
      .limit(+paginationType.pageSize)
      .lean();
    const getCountBlogs = await this.blogsModel.countDocuments({
      name: { $regex: paginationType.searchNameTerm, $options: 'i' },
    });
    return paginator(
      +paginationType.pageNumber,
      +paginationType.pageSize,
      getCountBlogs,
      findAndSortedBlogs,
    );
  }

  async createBlog(blog: any): Promise<BlogsViewModel> {
    const result = await this.blogsModel.insertMany(blog);
    const { _id, __v, ...blogsCopy } = blog;
    return blogsCopy;
  }

  //
  // async getBlogById(id: string): Promise<BlogsType | null> {
  //   return BlogsModel.findOne({ id }, { _id: 0, __v: 0 });
  // }
  //
  // async updateBlogById(
  //   id: string,
  //   name: string,
  //   description: string,
  //   websiteUrl: string,
  // ): Promise<boolean> {
  //   const result = await BlogsModel.updateOne(
  //     { id },
  //     {
  //       $set: {
  //         name: name,
  //         description: description,
  //         websiteUrl: websiteUrl,
  //       },
  //     },
  //   );
  //   return result.matchedCount === 1;
  // }
  //
  // async deleteBlog(id: string): Promise<boolean> {
  //   const result = await BlogsModel.deleteOne({ id });
  //   return result.deletedCount === 1;
}
