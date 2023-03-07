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
  async postWithLikeStatus(
    findAndSortedPost: any,
    userId: string | null,
  ): Promise<PostsViewModal[]> {
    const postWithLikeStatus = [];
    for (const post of findAndSortedPost) {
      const countLikes = await this.likeStatusModel.countDocuments({
        parentId: post.id,
        likeStatus: 'Like',
      });
      const countDislikes = await this.likeStatusModel.countDocuments({
        parentId: post.id,
        likeStatus: 'Dislike',
      });
      const findPostWithLikesByUserId = await this.likeStatusModel.findOne({
        parentId: post.id,
        userId: userId,
      });
      const findNewestPost = await this.likeStatusModel.find(
        {
          parentId: post.id,
          likeStatus: 'Like',
        },
        { _id: 0, __v: 0, parentId: 0, likeStatus: 0 },
        { sort: { _id: -1 }, limit: 3 },
      );

      post.extendedLikesInfo.likesCount = countLikes;
      post.extendedLikesInfo.dislikesCount = countDislikes;
      post.extendedLikesInfo.newestLikes = findNewestPost;

      if (findPostWithLikesByUserId) {
        post.extendedLikesInfo.myStatus = findPostWithLikesByUserId.likeStatus;
      } else {
        post.extendedLikesInfo.myStatus = 'None';
      }

      postWithLikeStatus.push(post);
    }
    return postWithLikeStatus;
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
    });
    comment.likesInfo.dislikesCount = await this.likeStatusModel.countDocuments(
      {
        parentId: comment.id,
        likeStatus: 'Dislike',
      },
    );
    if (userId) {
      const status = await this.likeStatusModel
        .findOne({ parentId: comment.id, userId }, { _id: 0, likeStatus: 1 })
        .lean();
      if (status) {
        comment.likesInfo.myStatus = status.likeStatus;
      }
    }
    return comment;
    // const commentWithLikeStatus = [];
    // for (const comment of findAndSortedComments) {
    //   const countLikes = await this.likeStatusModel.countDocuments({
    //     parentId: comment.id,
    //     likeStatus: 'Like',
    //   });
    //   const countDislikes = await this.likeStatusModel.countDocuments({
    //     parentId: comment.id,
    //     likeStatus: 'Dislike',
    //   });
    //   const findCommentWithLikesByUserId = await this.likeStatusModel.findOne({
    //     parentId: comment.id,
    //     userId: userId,
    //   });
    //
    //   comment.likesInfo.likesCount = countLikes;
    //   comment.likesInfo.dislikesCount = countDislikes;
    //
    //   if (findCommentWithLikesByUserId) {
    //     comment.likesInfo.myStatus = findCommentWithLikesByUserId.likeStatus;
    //   } else {
    //     comment.likesInfo.myStatus = 'None';
    //   }
    //
    //   commentWithLikeStatus.push(comment);
    // }
    // return commentWithLikeStatus;
  }
}
