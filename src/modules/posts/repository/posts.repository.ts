import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsDocument, PostsViewModal } from '../schemas/posts.schema';
import { Model } from 'mongoose';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { CreatePostDtoWithBlogId } from '../dto/createPostDto';
import {
  Comments,
  CommentsDocument,
  CommentsViewModal,
} from '../../comments/schema/comments.schema';
import {
  LikeStatus,
  LikeStatusDocument,
} from '../../comments/schema/likeStatus.schema';
import { LikeStatusRepository } from './likeStatus.repository';
import { UserModel } from '../../users/schemas/users.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Posts.name) private readonly postsModel: Model<PostsDocument>,
    @InjectModel(Comments.name)
    private readonly commentsModel: Model<CommentsDocument>,
    public likeStatusRepository: LikeStatusRepository,
  ) {}

  async findPosts(
    paginationType: PaginationDto,
    userId: string,
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
    const postWithLikes = await this.likeStatusRepository.postWithLikeStatus(
      findAndSortedPosts,
      userId,
    );
    return new PaginationViewModel<any>(
      getCountPosts,
      paginationType.pageNumber,
      paginationType.pageSize,
      postWithLikes,
    );
  }

  async createPost(newPost: Posts): Promise<PostsViewModal> {
    await this.postsModel.create({ ...newPost });
    return newPost;
  }

  async deletePostById(id: string): Promise<boolean> {
    const result = await this.postsModel.deleteOne({ id });
    return result.deletedCount === 1;
  }

  async findPostByIdFromLikesStatus(id: string): Promise<PostsViewModal[]> {
    return this.postsModel.find({ id }, { _id: 0, __v: 0 }).lean();
  }
  async findPostById(id: string): Promise<PostsViewModal[]> {
    return this.postsModel.findOne({ id }, { _id: 0, __v: 0 });
  }
  async findPostsByBlogId(
    blogId: string,
    paginationType: PaginationDto,
  ): Promise<PaginationViewModel<PostsViewModal[]>> {
    const findAndSortedPosts = await this.postsModel
      .find({ blogId }, { _id: 0, __v: 0 })
      .sort({
        [paginationType.sortBy]:
          paginationType.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(paginationType.getSkipSize())
      .limit(paginationType.pageSize)
      .lean();
    const getCountPosts = await this.postsModel.countDocuments({ blogId });
    return new PaginationViewModel<any>(
      getCountPosts,
      paginationType.pageNumber,
      paginationType.pageSize,
      findAndSortedPosts,
    );
  }
  async getCountPostsByBlogId(blogId: string) {
    return this.postsModel.countDocuments({ blogId });
  }
  async createCommentByPostId(newComment: any): Promise<CommentsViewModal> {
    const result = await this.commentsModel.create({ ...newComment });
    const { postId, ...commentCopy } = newComment;
    return commentCopy;
  }
  async updatePostById(
    id: string,
    post: CreatePostDtoWithBlogId,
  ): Promise<boolean> {
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
