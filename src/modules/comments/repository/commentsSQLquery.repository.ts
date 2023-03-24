import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsEntity } from '../domain/comments.entity';
import { Repository } from 'typeorm';
import { CommentsViewModal } from '../schema/comments.schema';
import { LikesEntity } from '../../posts/domain/entities/likes.entity';

@Injectable()
export class CommentsSQLqueryRepository {
  constructor(
    @InjectRepository(CommentsEntity)
    private commentsTable: Repository<CommentsEntity>,
    @InjectRepository(LikesEntity)
    private likesTable: Repository<LikesEntity>,
  ) {}

  async commentsWithLikeStatus(
    commentWithLikeStatus: CommentsEntity[],
    userId: string | null,
  ): Promise<CommentsViewModal[]> {
    return Promise.all(
      commentWithLikeStatus.map(async (c) => {
        return this.commentWithLikeStatus(c, userId);
      }),
    );
  }

  async commentWithLikeStatus(comment: any, userId: string | null) {
    comment.likesInfo.likesCount = await this.likesTable.count({
      where: {
        parentId: comment.id,
        likeStatus: 'Like',
        isUserBanned: false,
      },
    });
    comment.likesInfo.dislikesCount = await this.likesTable.count({
      where: {
        parentId: comment.id,
        likeStatus: 'Dislike',
        isUserBanned: false,
      },
    });
    if (userId) {
      const myStatus = await this.likesTable.findOne({
        where: {
          parentId: comment.id,
          userId,
        },
        select: ['likeStatus'],
      });
      comment.likesInfo.myStatus = myStatus ? myStatus.likeStatus : 'None';
    }
    return comment;
  }
}
