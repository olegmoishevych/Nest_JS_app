import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DevicesDocument = HydratedDocument<Devices>;

@Schema({ versionKey: false })
export class Devices {
  @Prop({ type: String })
  ip: string;
  @Prop({ type: String })
  title: string;
  @Prop({ type: String })
  lastActiveDate: string;
  @Prop({ type: String })
  deviceId: string;
  @Prop({ type: String })
  userId: string;
}

export const DevicesSchema = SchemaFactory.createForClass(Devices);

export class DevicesModal {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
    public userId: string,
  ) {}
}

export class UserVerifyDataModal {
  constructor(
    public userId: string,
    public deviceId: string,
    public iat: number,
    public exp: number,
  ) {}
}
