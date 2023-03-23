import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Not, Repository } from 'typeorm';
import { DevicesEntity } from '../domain/entities/devices.entity';

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
    const userSessionForDb = DevicesEntity.createUserSession(
      ip,
      title,
      lastActiveDate,
      deviceId,
      userId,
    );
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
    return this.devicesTable.delete({ userId, deviceId });
  }
}
