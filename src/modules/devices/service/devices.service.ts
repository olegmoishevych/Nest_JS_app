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
import { JwtRepository } from '../../auth/repository/jwt.repository';
import { DeleteResult, UpdateResult } from 'mongodb';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DevicesService {
  constructor(
    public devicesRepository: DevicesRepository,
    public jwtRepository: JwtRepository,
    public jwtService: JwtService,
  ) {}

  async createUserSession(
    ip: string,
    title: string,
    lastActiveDate: Date,
    deviceId: string,
    userId: string,
  ): Promise<DevicesModal> {
    const newSession = new DevicesModal(
      ip,
      title,
      new Date(),
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

  // async updateUserSession(
  //   ip: string,
  //   title: string,
  //   lastActiveDate: Date,
  //   deviceId: string,
  //   userId: string,
  // ): Promise<UpdateResult> {
  //   const updatedSession = new DevicesModal(
  //     ip,
  //     title,
  //     // lastActiveDate,
  //     new Date(),
  //     deviceId,
  //     userId,
  //   );
  //   return this.devicesRepository.updateUserSessionById(updatedSession);
  // }

  async getAllDevices(refreshToken: string): Promise<DevicesModal[]> {
    console.log('refreshToken', refreshToken);
    const findUserInBlackList =
      await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    if (findUserInBlackList) throw new UnauthorizedException([]);
    const getUserDataByToken = await this.tokenVerify(refreshToken);
    console.log('getUserDataByToken', getUserDataByToken);
    if (!getUserDataByToken) throw new UnauthorizedException([]);
    const userId = getUserDataByToken.userId;
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
    const findUserInBlackList =
      await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    if (findUserInBlackList) throw new UnauthorizedException([]);
    const getUserDataByToken = await this.tokenVerify(refreshToken);
    if (!getUserDataByToken) throw new UnauthorizedException([]);
    const userId = getUserDataByToken.userId;
    const deviceId = getUserDataByToken.deviceId;
    return this.devicesRepository.deleteAllDevicesById(userId, deviceId);
  }

  async deleteAllDevicesByDeviceId(
    refreshToken: string,
    deviceId: string,
  ): Promise<boolean> {
    const getUserDataByToken = await this.tokenVerify(refreshToken);
    if (!getUserDataByToken)
      throw new UnauthorizedException(['User by token not found']);
    const findDeviceByDeviceId =
      await this.devicesRepository.findDeviceByDeviceId(deviceId);
    if (!findDeviceByDeviceId) throw new NotFoundException(['User not found']);
    if (getUserDataByToken.userId !== findDeviceByDeviceId.userId)
      throw new ForbiddenException(['Its not your device']);
    return this.devicesRepository.deleteUserSessionByUserAndDeviceId(
      getUserDataByToken.userId,
      deviceId,
    );
  }
}