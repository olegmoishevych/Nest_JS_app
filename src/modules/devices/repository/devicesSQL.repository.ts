import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Not, Repository } from 'typeorm';
import { DevicesEntity } from '../domain/entities/devices.entity';
import { DevicesModal } from '../schemas/devices.schemas';

@Injectable()
export class DevicesSQLRepository {
  constructor(
    @InjectRepository(DevicesEntity)
    private devicesTable: Repository<DevicesEntity>,
  ) {}

  async createUserSession(
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string,
    userId: string,
  ): Promise<DevicesEntity> {
    const userSessionForDb = new DevicesEntity();
    userSessionForDb.deviceId = deviceId;
    userSessionForDb.userId = userId;
    userSessionForDb.ip = ip;
    userSessionForDb.title = title;
    userSessionForDb.lastActiveDate = lastActiveDate;
    return this.devicesTable.save(userSessionForDb);
  }

  async findAllUserDevicesByUserId(userId): Promise<DevicesEntity[]> {
    return this.devicesTable
      .createQueryBuilder('d')
      .select(['d.ip', 'd.title', 'd.lastActiveDate', 'd.deviceId'])
      .where('d.userId = :userId', { userId })
      .getMany();
  }

  async deleteAllDevicesById(
    userId: string,
    currentDeviceId: string,
  ): Promise<DeleteResult> {
    return this.devicesTable.delete({ userId, deviceId: Not(currentDeviceId) });
  }
  async findDeviceByDeviceId(deviceId: string): Promise<DevicesEntity> {
    return this.devicesTable.findOneBy({ deviceId });
  }
  async deleteUserSessionByUserAndDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<DeleteResult> {
    return this.devicesTable.delete({
      userId: userId,
      deviceId: deviceId,
    });
  }
  async deleteSessionByDeviceId(deviceId: string): Promise<DeleteResult> {
    return this.devicesTable.delete({ deviceId });
  }
  async findDeviceByUserIdDeviceIdAndLastActiveDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<DevicesEntity> {
    // console.log('lastActiveDate', lastActiveDate);
    // return this.devicesTable.findOneBy({ userId, deviceId, lastActiveDate });
    return this.devicesTable.findOne({
      where: {
        userId: userId,
        deviceId: deviceId,
        lastActiveDate: lastActiveDate,
      },
    });
  }
  async saveResult(newSession: DevicesEntity): Promise<DevicesEntity> {
    return this.devicesTable.save(newSession);
  }
  async deleteSessionsBanUserById(userId: string): Promise<DeleteResult> {
    return this.devicesTable.delete({ userId });
  }
}
