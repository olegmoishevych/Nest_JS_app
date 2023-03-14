import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogsDocument = HydratedDocument<Blogs>;

export class BanInfo {
  @Prop()
  isBanned: boolean;
  @Prop()
  banDate: Date;
}

export class BlogOwnerInfo {
  @Prop({ type: String })
  userId: string;
  @Prop({ type: String })
  userLogin: string;
}

@Schema({ versionKey: false })
export class Blogs {
  @Prop({ type: String })
  id: string;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  websiteUrl: string;
  @Prop({ type: String })
  createdAt: string;
  @Prop({ type: Boolean })
  isMembership: boolean;
  @Prop({ type: BlogOwnerInfo })
  blogOwnerInfo: BlogOwnerInfo;
  @Prop({ type: BanInfo })
  banInfo: BanInfo;
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs);

export class BlogsViewModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export class BlogsModelFor_DB {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public banInfo: {
      isBanned: boolean;
      banDate: Date;
    },
  ) {}
}
