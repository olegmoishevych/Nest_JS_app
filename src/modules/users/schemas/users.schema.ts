import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

export class EmailConfirmation {
  @Prop({ type: String })
  confirmationCode: string;
  @Prop({ type: Date })
  expirationDate: Date;
  @Prop({ type: Boolean })
  isConfirmed: boolean;
}
export class BanInfo {
  @Prop({ type: Boolean })
  isBanned: boolean;
  @Prop({ type: Date })
  banDate: Date;
  @Prop({ type: String })
  banReason: string;
}
@Schema({ versionKey: false })
export class Users {
  @Prop({ type: String, required: true })
  id: string;
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String })
  passwordHash: string;
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String })
  createdAt: string;
  @Prop({ type: Object })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: Object })
  banInfo: BanInfo;
}

export const UsersSchema = SchemaFactory.createForClass(Users);

export class UsersModel_For_DB {
  constructor(
    public id: string,
    public login: string,
    public passwordHash: string,
    public email: string,
    public createdAt: string,
    public emailConfirmation: {
      confirmationCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    },
    public banInfo: {
      isBanned: boolean;
      banDate: Date;
      banReason: string;
    },
  ) {}
}

export class UserModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public createdAt: string,
    public banInfo: {
      isBanned: boolean;
      banDate: Date;
      banReason: string;
    },
  ) {}
}

export class MeViewModel {
  constructor(
    public userId: string,
    public login: string,
    public email: string,
  ) {}
}
