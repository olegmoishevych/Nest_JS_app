import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostsDocument = HydratedDocument<Posts>;

@Schema()
export class Posts {
  @Prop({ type: String })
  id: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  shortDescription: string;
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String })
  blogName: string;
  @Prop({ type: String })
  createdAt: string;
  @Prop({ type: String })
  extendedLikesInfo: LikesInfo;
}

export class LikesInfo {
  @Prop({ type: Number })
  likesCount: number;
  @Prop({ type: Number })
  dislikesCount: number;
  @Prop({ type: String })
  myStatus: string;
  @Prop({ type: Array })
  newestLikes: [];
}

export class PostsType_For_DB {
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

export const PostsSchema = SchemaFactory.createForClass(Posts);
