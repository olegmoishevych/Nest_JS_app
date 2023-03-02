import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostsViewModal, Posts, PostsDocument } from '../schemas/posts.schema';
import { Model } from 'mongoose';
import {
  BlogPaginationDto,
  PaginationDto,
} from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { BlogsViewModel } from '../../blogs/schemas/blogs.schema';
import { CreatePostDto } from '../dto/createPostDto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Posts.name) private readonly postsModel: Model<PostsDocument>,
  ) {}
  async findPosts(
    paginationType: PaginationDto,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    const findAndSortedPosts = await this.postsModel
      .find({}, { _id: 0, __v: 0 })
      .sort({
        [paginationType.sortBy]:
          paginationType.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(paginationType.getSkipSize())
      .limit(paginationType.pageSize)
      .lean();
    const getCountPosts = await this.postsModel.countDocuments();
    // const postWithLikes = await postsWithLikeStatus(findAndSortedPosts, userId);
    return new PaginationViewModel<any>(
      getCountPosts,
      paginationType.pageNumber,
      paginationType.pageSize,
      findAndSortedPosts,
    );
  }
  async createPost(newPost: any): Promise<PostsViewModal> {
    const result = await this.postsModel.insertMany(newPost);
    const { _id, __v, ...postCopy } = newPost;
    return postCopy;
  }
  async deletePostById(id: string): Promise<boolean> {
    const result = await this.postsModel.deleteOne({ id });
    return result.deletedCount === 1;
  }
  async findPostById(id: string): Promise<PostsViewModal[]> {
    return this.postsModel.findOne({ id }, { _id: 0, __v: 0 });
  }
  async updatePostById(id: string, post: CreatePostDto): Promise<boolean> {
    return this.postsModel.findOneAndUpdate(
      { id },
      {
        $set: {
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
        },
      },
    );
  }
}
