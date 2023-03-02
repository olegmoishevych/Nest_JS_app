import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentsDocument = HydratedDocument<Comments>;

class LikesInfo {
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
}

class CommentatorInfo {
  @Prop()
  userId: string;
  @Prop()
  userLogin: string;
}

@Schema()
export class Comments {
  @Prop()
  id: string;
  @Prop()
  content: string;
  @Prop()
  postId: string;
  @Prop()
  commentatorInfo: CommentatorInfo;
  @Prop()
  createdAt: Date;
  @Prop()
  likesInfo: LikesInfo;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);

export class CommentsViewModal {
  constructor(
    public id: string,
    public content: string,
    public postId: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public createdAt: string,
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
    },
  ) {}
}
