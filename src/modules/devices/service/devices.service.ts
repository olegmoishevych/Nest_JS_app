import { DevicesRepository } from '../repository/devices.repository';
import { DevicesModal, UserVerifyDataModal } from '../schemas/devices.schemas';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { JWT } from '../../auth/constants';
import { DeleteResult } from 'mongodb';

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

  async getAllDevices(refreshToken: string): Promise<DevicesModal[]> {
    if (!refreshToken) throw new UnauthorizedException([]);
    const user = await this.tokenVerify(refreshToken);
    if (!user) throw new UnauthorizedException([]);
    const userId = user.userId;
    return this.devicesRepository.findAllUserDevicesByUserId(userId);
  }

  async tokenVerify(token: string): Promise<UserVerifyDataModal> {
    try {
      const result: any = jwt.verify(token, JWT.jwt_secret);
      return result;
    } catch (error) {
      return null;
    }
  }

  async deleteAllDevices(refreshToken: string): Promise<DeleteResult> {
    if (!refreshToken) throw new UnauthorizedException([]);
    const lastActive = this.getLastActiveDateFromRefreshToken(refreshToken);
    if (!lastActive) throw new UnauthorizedException([]);
    const user = await this.tokenVerify(refreshToken);
    if (!user) throw new UnauthorizedException([]);
    const { userId, deviceId } = user;
    return this.devicesRepository.deleteAllDevicesById(userId, deviceId);
  }

  async deleteAllDevicesByDeviceId(
    refreshToken: string,
    deviceId: string,
  ): Promise<boolean> {
    if (!refreshToken) throw new UnauthorizedException([]);
    const user = await this.tokenVerify(refreshToken);
    if (!user) throw new UnauthorizedException(['User by token not found']);
    const device = await this.devicesRepository.findDeviceByDeviceId(deviceId);
    if (!device) throw new NotFoundException(['User not found']);
    if (user.userId !== device.userId)
      throw new ForbiddenException(['Its not your device']);
    return this.devicesRepository.deleteUserSessionByUserAndDeviceId(
      user.userId,
      deviceId,
    );
  }

  getLastActiveDateFromRefreshToken(refreshToken: string): string {
    const payload: any = jwt.decode(refreshToken);
    return new Date(payload.iat * 1000).toISOString();
  }
}
