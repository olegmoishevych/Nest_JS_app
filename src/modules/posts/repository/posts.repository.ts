import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Posts, PostsDocument, PostsViewModal } from '../schemas/posts.schema';
import { Model } from 'mongoose';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import { CreatePostDto, PostsViewModalFor_DB } from '../dto/createPostDto';
import {
  Comments,
  CommentsDocument,
  CommentsViewModal,
} from '../../comments/schema/comments.schema';
import { LikeStatusRepository } from './likeStatus.repository';

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
    const projection = { _id: 0, __v: 0, isUserBanned: 0 };
    const findAndSortedPosts = await this.postsModel
      .find({ isUserBanned: false }, projection)
      .sort({
        [paginationType.sortBy]:
          paginationType.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(paginationType.getSkipSize())
      .limit(paginationType.pageSize)
      .lean();
    const getCountPosts = await this.postsModel.countDocuments();
    const postsWithLikes = await this.likeStatusRepository.postsWithLikeStatus(
      findAndSortedPosts,
      userId,
    );
    return new PaginationViewModel<PostsViewModal[]>(
      getCountPosts,
      paginationType.pageNumber,
      paginationType.pageSize,
      postsWithLikes,
    );
  }

  async createPost(newPost: PostsViewModalFor_DB): Promise<PostsViewModal> {
    await this.postsModel.create({ ...newPost });
    const { userId, isUserBanned, ...postCopy } = newPost;
    return postCopy;
  }

  async deletePostById(postId: string, userId: string): Promise<boolean> {
    const result = await this.postsModel.deleteOne({ id: postId, userId });
    return result.deletedCount === 1;
  }

  async findPostById(id: string): Promise<PostsViewModal> {
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
    return new PaginationViewModel<PostsViewModal[]>(
      getCountPosts,
      paginationType.pageNumber,
      paginationType.pageSize,
      findAndSortedPosts,
    );
  }

  async getCountPostsByBlogId(blogId: string): Promise<number> {
    return this.postsModel.countDocuments({ blogId });
  }

  async createCommentByPostId(newComment: any): Promise<CommentsViewModal> {
    const result = await this.commentsModel.create({ ...newComment });
    const { postId, isUserBanned, ...commentCopy } = newComment;
    return commentCopy;
  }

  async updateBannedUserById(userId: string): Promise<boolean> {
    return this.postsModel.findOneAndUpdate(
      { userId },
      { $set: { isUserBanned: true } },
    );
  }

  async updatePostById(
    id: string,
    post: CreatePostDto,
    userId: string,
  ): Promise<boolean> {
    return this.postsModel.findOneAndUpdate(
      { id, userId },
      {
        $set: {
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
        },
      },
    );
  }
}
