import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RecoveryCodeDocument = HydratedDocument<RecoveryCode>;

@Schema({ versionKey: false })
export class RecoveryCode {
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: String })
  recoveryCode: string;
}

export class RecoveryCodeModal {
  constructor(public email: string, public recoveryCode: string) {}
}

export const RecoveryCodeSchema = SchemaFactory.createForClass(RecoveryCode);
