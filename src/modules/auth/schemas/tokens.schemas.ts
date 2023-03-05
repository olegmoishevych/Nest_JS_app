import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TokensDocument = HydratedDocument<Tokens>;

@Schema({ versionKey: false })
export class Tokens {
  @Prop({ type: String })
  refreshToken: string;
}

export const TokensSchema = SchemaFactory.createForClass(Tokens);
