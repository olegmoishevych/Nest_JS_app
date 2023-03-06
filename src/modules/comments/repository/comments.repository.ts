import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comments,
  CommentsDocument,
  CommentsViewModal,
} from '../schema/comments.schema';
import { Model } from 'mongoose';
import { PaginationDto } from '../../helpers/dto/pagination.dto';
import { PaginationViewModel } from '../../helpers/pagination/pagination-view-model';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comments.name)
    private readonly commentsModel: Model<CommentsDocument>,
  ) {}

  async findCommentsByPostId(
    postId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationViewModel<CommentsViewModal[]>> {
    const findAndSortedComments = await this.commentsModel
      .find({ postId }, { _id: 0, __v: 0, postId: 0 })
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

  async findCommentById(id: string): Promise<CommentsViewModal> {
    return this.commentsModel.findOne({ id }, { _id: 0, __v: 0, postId: 0 });
  }
  async deleteCommentById(commentId: string, userId: string) {
    return this.commentsModel.findOneAndDelete({
      parentId: commentId,
      userId: userId,
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
}
