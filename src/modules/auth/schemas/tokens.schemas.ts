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

export const TokensSchema = SchemaFactory.createForClass(Tokens);
