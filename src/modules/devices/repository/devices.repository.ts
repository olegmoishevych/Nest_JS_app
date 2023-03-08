import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Devices,
  DevicesDocument,
  DevicesModal,
} from '../schemas/devices.schemas';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Devices.name)
    private readonly devicesModel: Model<DevicesDocument>,
  ) {}

  async createUserSession(newSession: Devices): Promise<DevicesModal> {
    return this.devicesModel.create({ ...newSession });
  }
  async deleteSessionByUserId(
    deviceId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.devicesModel.deleteMany({ userId, deviceId });
    return result.deletedCount === 1;
  }
}
