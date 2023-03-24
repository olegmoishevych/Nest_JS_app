import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../domain/comments.entity';
import { Repository } from 'typeorm';
import { CommentsViewModal } from '../schema/comments.schema';

@Injectable()
export class CommentsSQLqueryRepository {
  constructor(
    @InjectRepository(CommentsEntity)
    private commentsTable: Repository<CommentsEntity>,
  ) {}
  async commentsWithLikeStatus(
    commentWithLikeStatus: any,
    userId: string | null,
  ): Promise<CommentsViewModal[]> {
    return Promise.all(
      commentWithLikeStatus.map(async (c) => {
        // return this.commentWithLikeStatus(c, userId);
      }),
    );
  }
  // async commentWithLikeStatus(
  //   comment: CommentsViewModal,
  //   userId: string | null,
  // ): Promise<CommentsViewModal> {
  //   comment.likesInfo.likesCount = await this.likeStatusModel.countDocuments({
  //     parentId: comment.id,
  //     likeStatus: 'Like',
  //     isUserBanned: false,
  //   });
  //   comment.likesInfo.dislikesCount = await this.likeStatusModel.countDocuments(
  //     {
  //       parentId: comment.id,
  //       likeStatus: 'Dislike',
  //       isUserBanned: false,
  //     },
  //   );
  //   if (userId) {
  //     const status = await this.likeStatusModel
  //       .findOne({ parentId: comment.id, userId }, { _id: 0, likeStatus: 1 })
  //       .lean();
  //     comment.likesInfo.myStatus = status ? status.likeStatus : 'None';
  //   }
  //   return comment;
}
