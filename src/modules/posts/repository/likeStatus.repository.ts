import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LikeStatus,
  LikeStatusDocument,
  LikeStatusModal,
} from '../../comments/schema/likeStatus.schema';
import { PostsViewModal } from '../schemas/posts.schema';

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
}
