import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

export type UsersDocument = HydratedDocument<Users>;

@Schema({ versionKey: false })
export class Users {
  @Prop({ type: String, required: true })
  id: string;
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String })
  createdAt: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

export class UserType_For_DB extends Users {
  _id: ObjectId;
}

export class UsersViewModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
  ) {}
}
