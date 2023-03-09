import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';
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

  async updateUserSessionById(
    // userId: string,
    // deviceId: string,
    // ip: string,
    // title: string,
    // date: string,
    newSession: DevicesModal,
  ): Promise<UpdateResult> {
    return this.devicesModel.updateOne(
      { userId: newSession.userId, deviceId: newSession.deviceId },
      { $set: { ...newSession } },
    );
  }

  async findAllUserDevicesByUserId(userId: string): Promise<DevicesModal[]> {
    return this.devicesModel.find({ userId }, { _id: 0, userId: 0 });
  }

  async findDeviceByDeviceId(deviceId: string): Promise<DevicesModal> {
    return this.devicesModel.findOne({ deviceId });
  }

  async deleteAllDevicesById(userId, deviceId): Promise<DeleteResult> {
    return this.devicesModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });
  }

  async deleteUserSessionByUserAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const res = await this.devicesModel.deleteOne({ userId, deviceId });
    return res.deletedCount === 1;
  }
}
