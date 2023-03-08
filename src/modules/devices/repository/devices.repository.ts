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
  async findUserDeviceByUserId(userId: string): Promise<DevicesModal> {
    return this.devicesModel.findOne({ userId }, { _id: 0, userId: 0 });
  }
  async findDeviceByDeviceId(deviceId: string): Promise<DevicesModal> {
    return this.devicesModel.findOne({ deviceId });
  }
  async deleteAllDevicesById(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const result = await this.devicesModel.deleteMany({
      userId,
      deviceId: { $in: deviceId },
    });
    return result.deletedCount === 1;
  }
  async deleteUserSessionByUserAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const res = await this.devicesModel.deleteOne({ userId, deviceId });
    return res.deletedCount === 1;
  }
}
