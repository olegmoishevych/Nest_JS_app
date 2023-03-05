import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

export type TokensDocument = HydratedDocument<Tokens>;

@Schema({ versionKey: false })
export class Tokens {
  @Prop({ type: String })
  refreshToken: string;
}

export class TokensViewModel {
  constructor(public _id: ObjectId, public refreshToken: string) {}
}

export class JwtTokenPairViewModel {
  constructor(public accessToken: string, public refreshToken: string) {}
}

export class TokensVerifyViewModal {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: number,
    public exp: number,
  ) {}
}
export const TokensSchema = SchemaFactory.createForClass(Tokens);
