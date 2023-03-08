import { Injectable } from '@nestjs/common';
import { DevicesRepository } from '../repository/devices.repository';
import { DevicesModal } from '../schemas/devices.schemas';

@Injectable()
export class DevicesService {
  constructor(public devicesRepository: DevicesRepository) {}

  async createUserSession(
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string,
    userId: string,
  ): Promise<DevicesModal> {
    const newSession = new DevicesModal(
      ip,
      title,
      lastActiveDate,
      deviceId,
      userId,
    );
    return this.devicesRepository.createUserSession(newSession);
  }
  async deleteSessionByUserId(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    return this.devicesRepository.deleteSessionByUserId(deviceId, userId);
  }
}
