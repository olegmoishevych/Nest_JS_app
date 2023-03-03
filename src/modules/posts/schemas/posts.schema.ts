import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostsDocument = HydratedDocument<Posts>;

class LikesInfo {
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop()
  myStatus: string;
  @Prop()
  newestLikes: [];
}

@Schema({ versionKey: false })
export class Posts {
  @Prop()
  id: string;
  @Prop()
  title: string;
  @Prop()
  shortDescription: string;
  @Prop()
  content: string;
  @Prop()
  blogId: string;
  // @Prop()
  // parentId: string;
  @Prop()
  blogName: string;
  @Prop()
  createdAt: string;
  // @Prop()
  // userId: string;
  @Prop()
  extendedLikesInfo: LikesInfo;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);

export class PostsViewModal {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
      newestLikes: [];
    },
  ) {}
}
