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
  async updateUserSessionById(updatedSession: Devices): Promise<DevicesModal> {
    return this.devicesModel.findOneAndUpdate(
      { userId: updatedSession.userId, deviceId: updatedSession.deviceId },
      { $set: updatedSession },
    );
  }
  async findUserDeviceById(userId: string): Promise<DevicesModal> {
    return this.devicesModel.findOne({ userId }, { _id: 0, userId: 0 });
  }
}
