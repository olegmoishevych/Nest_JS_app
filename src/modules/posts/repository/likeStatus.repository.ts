import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LikeStatus,
  LikeStatusDocument,
  LikeStatusModal,
} from '../../comments/schema/likeStatus.schema';
import { PostsViewModal } from '../schemas/posts.schema';
import { CommentsViewModal } from '../../comments/schema/comments.schema';

@Injectable()
export class LikeStatusRepository {
  constructor(
    @InjectModel(LikeStatus.name)
    private readonly likeStatusModel: Model<LikeStatusDocument>,
  ) {}

  async updateLikeStatusByPostId(
    updateLikeStatusByPostId: LikeStatusModal,
  ): Promise<LikeStatusModal> {
    return this.likeStatusModel.findOneAndUpdate(
      {
        parentId: updateLikeStatusByPostId.parentId,
        userId: updateLikeStatusByPostId.userId,
      },
      { ...updateLikeStatusByPostId },
      { upsert: true },
    );
  }

  async postsWithLikeStatus(
    posts: PostsViewModal[],
    userId: string | null,
  ): Promise<PostsViewModal[]> {
    return Promise.all(
      posts.map(async (c) => {
        return this.postWithLikeStatus(c, userId);
      }),
    );
  }

  async postWithLikeStatus(
    post: PostsViewModal,
    userId: string | null,
  ): Promise<PostsViewModal> {
    post.extendedLikesInfo.likesCount =
      await this.likeStatusModel.countDocuments({
        parentId: post.id,
        likeStatus: 'Like',
        isUserBanned: false,
      });
    post.extendedLikesInfo.dislikesCount =
      await this.likeStatusModel.countDocuments({
        parentId: post.id,
        likeStatus: 'Dislike',
        isUserBanned: false,
      });
    post.extendedLikesInfo.newestLikes = await this.likeStatusModel
      .find(
        {
          parentId: post.id,
          likeStatus: 'Like',
          isUserBanned: false,
        },
        { _id: 0, __v: 0, parentId: 0, likeStatus: 0, isUserBanned: 0 },
        { sort: { _id: -1 }, limit: 3 },
      )
      .lean();
    if (userId) {
      const status = await this.likeStatusModel
        .findOne(
          { parentId: post.id, userId },
          { _id: 0, likeStatus: 1, isUserBanned: 0 },
        )
        .lean();
      if (status) {
        post.extendedLikesInfo.myStatus = status.likeStatus;
      }
    }
    return post;
  }

  async commentsWithLikeStatus(
    commentWithLikeStatus: CommentsViewModal[],
    userId: string | null,
  ): Promise<CommentsViewModal[]> {
    return Promise.all(
      commentWithLikeStatus.map(async (c) => {
        return this.commentWithLikeStatus(c, userId);
      }),
    );
  }

  async commentWithLikeStatus(
    comment: CommentsViewModal,
    userId: string | null,
  ): Promise<CommentsViewModal> {
    comment.likesInfo.likesCount = await this.likeStatusModel.countDocuments({
      parentId: comment.id,
      likeStatus: 'Like',
      isUserBanned: false,
    });
    comment.likesInfo.dislikesCount = await this.likeStatusModel.countDocuments(
      {
        parentId: comment.id,
        likeStatus: 'Dislike',
        isUserBanned: false,
      },
    );
    if (userId) {
      const status = await this.likeStatusModel
        .findOne(
          { parentId: comment.id, userId },
          { _id: 0, likeStatus: 1, isUserBanned: 0 },
        )
        .lean();
      if (status) {
        comment.likesInfo.myStatus = status.likeStatus;
      }
    }
    return comment;
  }
  async updateBannedUserById(userId: string): Promise<boolean> {
    return this.likeStatusModel.findOneAndUpdate(
      { userId },
      { $set: { isUserBanned: true } },
    );
  }
}
