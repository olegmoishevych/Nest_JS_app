import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comments,
  CommentsDocument,
  CommentsForPostsViewModal,
  CommentsViewModal,
} from '../schema/comments.schema';
import { Model } from 'mongoose';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';
import {
  LikeStatus,
  LikeStatusDocument,
  LikeStatusModal,
} from '../schema/likeStatus.schema';
import {
  Users,
  UsersDocument,
  UsersModel_For_DB,
} from '../../users/schemas/users.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name)
    private readonly commentsModel: Model<CommentsDocument>,
    @InjectModel(Users.name)
    private readonly usersModel: Model<UsersDocument>,
    @InjectModel(LikeStatus.name)
    private readonly likeStatusModel: Model<LikeStatusDocument>,
  ) {}

  async findCommentsByPostId(
    postId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<CommentsViewModal[]>> {
    const findAndSortedComments = await this.commentsModel
      .find(
        { postId, isUserBanned: false },
        { _id: 0, __v: 0, postId: 0, isUserBanned: 0 },
      )
      .sort({
        [paginationDto.sortBy]: paginationDto.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(paginationDto.getSkipSize())
      .limit(paginationDto.pageSize)
      .lean();
    const getCountComments = await this.commentsModel.countDocuments({
      postId,
    });
    return new PaginationViewModel<any>(
      getCountComments,
      paginationDto.pageNumber,
      paginationDto.pageSize,
      findAndSortedComments,
    );
  }
  async getCommentsByUserId(
    pagination: PaginationDto,
    userId: string,
  ): Promise<PaginationViewModel<CommentsForPostsViewModal[]>> {
    const find = {
      'commentatorInfo.userId': userId,
      // isUserBanned: false,
    };
    const projection = { _id: 0, isUserBanned: 0, likesInfo: 0, postId: 0 };
    const findAndSortedComments = await this.commentsModel
      .find(find, projection)
      .sort({
        [pagination.sortBy]: pagination.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(pagination.getSkipSize())
      .limit(pagination.pageSize)
      .lean();
    const findCountComments = await this.commentsModel.countDocuments({
      'commentatorInfo.userId': userId,
    });
    // const commentsWithInfo = [];
    // for (const comment of findAndSortedComments) {
    //   const commentInfo = {
    //     id: comment.id,
    //     content: comment.content,
    //     createdAt: comment.createdAt,
    //     likesInfo: comment.likesInfo,
    //     commentatorInfo: {
    //       userId: comment.commentatorInfo.userId,
    //       userLogin: comment.commentatorInfo.userLogin,
    //     },
    //     postInfo: {
    //       id: comment.id,
    //       title: comment.,
    //       blogId: comment.,
    //       blogName: comment.postInfo.blogName,
    //     },
    //   };
    //   commentsWithInfo.push(commentInfo);
    // }
    return new PaginationViewModel<CommentsForPostsViewModal[]>(
      findCountComments,
      pagination.pageNumber,
      pagination.pageSize,
      findAndSortedComments,
    );
  }
  async findCommentById(id: string): Promise<CommentsViewModal> {
    return this.commentsModel.findOne(
      { id, isUserBanned: false },
      { _id: 0, __v: 0, postId: 0, isUserBanned: 0 },
    );
  }
  async deleteCommentById(
    commentId: string,
    userId: string,
  ): Promise<CommentsViewModal> {
    return this.commentsModel.findOneAndDelete({
      id: commentId,
      'commentatorInfo.userId': userId,
    });
  }

  async updateCommentById(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<CommentsViewModal> {
    return this.commentsModel.findOneAndUpdate(
      { id: commentId, 'commentatorInfo.userId': userId },
      { $set: { content } },
    );
  }

  async updateLikeStatusByCommentId(
    commentId: string,
    userId: string,
    newLikeStatus: LikeStatusModal,
  ): Promise<CommentsViewModal> {
    return this.likeStatusModel.findOneAndUpdate(
      { parentId: commentId, userId },
      { ...newLikeStatus },
      { upsert: true },
    );
  }
  async getCountCollection(postId: string): Promise<number> {
    return this.commentsModel.countDocuments({ postId });
  }
  async updateBannedUserById(
    id: string,
    user: UsersModel_For_DB,
  ): Promise<boolean> {
    const set = user.banInfo.isBanned
      ? { isUserBanned: false }
      : { isUserBanned: true };
    return this.commentsModel.findOneAndUpdate(
      { 'commentatorInfo.userId': id },
      { $set: set },
    );
  }
}
