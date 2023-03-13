import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Blogs } from './blogs.schema';
import { HydratedDocument } from 'mongoose';

export type UserBannedDocument = HydratedDocument<UserBanned>;

export class banInfo {
  @Prop({ type: Boolean })
  isBanned: boolean;
  @Prop({ type: Date })
  banDate: Date;
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
  @Prop({ type: String, required: true })
  banInfo: banInfo;
}

export const UserBannedSchema = SchemaFactory.createForClass(UserBanned);
