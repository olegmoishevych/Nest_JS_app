import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserBannedDocument = HydratedDocument<UserBanned>;

export class banInfo {
  @Prop({ type: Boolean })
  isBanned: boolean;
  @Prop({ type: String })
  banDate: string;
  @Prop({ type: String })
  banReason: string;
}

@Schema({ versionKey: false })
export class UserBanned {
  @Prop({ type: String })
  id: string;
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop()
  banInfo: banInfo;
}

export class BlogsUserViewModel {
  constructor(
    public id: string,
    public login: string,
    public banInfo: banInfo,
  ) {}
}

export class BlogsUserViewModelFor_DB {
  constructor(
    public id: string,
    public login: string,
    public blogId: string,
    public banInfo: {
      isBanned: boolean;
      banDate: string;
      banReason: string;
    },
  ) {}
}

export const UserBannedSchema = SchemaFactory.createForClass(UserBanned);
