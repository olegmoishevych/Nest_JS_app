import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentsDocument = HydratedDocument<Comments>;

class PostInfo {
  @Prop()
  id: string;
  @Prop()
  title: string;
  @Prop()
  blogId: string;
  @Prop()
  blogName: string;
}

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

@Schema({ versionKey: false })
export class Comments {
  @Prop()
  id: string;
  @Prop()
  isUserBanned: boolean;
  @Prop()
  content: string;
  @Prop()
  createdAt: string;
  @Prop()
  postId: string;
  @Prop()
  commentatorInfo: CommentatorInfo;
  @Prop()
  likesInfo: LikesInfo;
  @Prop()
  postInfo: PostInfo;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);

export class CommentsViewModalFor_DB {
  constructor(
    public id: string,
    public isUserBanned: boolean,
    public content: string,
    public createdAt: string,
    public postId: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
    },
    public postInfo: {
      id: string;
      title: string;
      blogId: string;
      blogName: string;
    },
  ) {}
}

export class CommentsViewModal {
  constructor(
    public id: string,
    public content: string,
    public createdAt: string,
    public postId: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },

    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
    },
  ) {}
}

export class CommentsForPostsViewModal {
  constructor(
    public id: string,
    public content: string,
    public createdAt: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public postInfo: {
      id: string;
      title: string;
      blogId: string;
      blogName: string;
    },
  ) {}
}
