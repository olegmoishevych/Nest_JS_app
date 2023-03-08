import { DevicesRepository } from '../repository/devices.repository';
import { DevicesModal, UserVerifyDataModal } from '../schemas/devices.schemas';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensVerifyViewModal } from '../../auth/schemas/tokens.schemas';
import jwt from 'jsonwebtoken';
import { JWT } from '../../auth/constants';

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

  async updateUserSession(
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string,
    userId: string,
  ): Promise<DevicesModal> {
    const updatedSession = new DevicesModal(
      ip,
      title,
      lastActiveDate,
      deviceId,
      userId,
    );
    return this.devicesRepository.updateUserSessionById(updatedSession);
  }

  async getAllDevices(refreshToken: string): Promise<DevicesModal> {
    const getUserDataByToken = await this.tokenVerify(refreshToken);
    if (!getUserDataByToken) throw new UnauthorizedException([]);
    const userId = getUserDataByToken.userId;
    return this.devicesRepository.findUserDeviceById(userId);
  }

  async tokenVerify(token: string): Promise<UserVerifyDataModal> {
    try {
      const result: any = jwt.verify(token, JWT.jwt_secret);
      return result;
    } catch (error) {
      return null;
    }
  }
}
