import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikeStatusDocument = HydratedDocument<LikeStatus>;

export enum LikeStatusEnum {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Schema({ versionKey: false })
export class LikeStatus {
  @Prop({ type: String })
  parentId: string;
  @Prop({ type: String })
  userId: string;
  @Prop({ type: String })
  login: string;
  @Prop({ type: Date })
  addedAt: Date;
  @Prop({ type: String, enum: LikeStatusEnum })
  likeStatus: LikeStatusEnum;
}

export const LikeStatusSchema = SchemaFactory.createForClass(LikeStatus);
