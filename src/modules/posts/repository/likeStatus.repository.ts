import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LikeStatus,
  LikeStatusDocument,
  LikeStatusModal,
} from '../../comments/schema/likeStatus.schema';

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
}
