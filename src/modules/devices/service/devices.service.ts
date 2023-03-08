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
import { DeleteResult } from 'mongodb';
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

  async getAllDevices(refreshToken: string): Promise<DevicesModal[]> {
    // const findUserInBlackList =
    //   await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    // if (findUserInBlackList) throw new UnauthorizedException([]);
    const getUserDataByToken = await this.tokenVerify(refreshToken);
    if (!getUserDataByToken) throw new UnauthorizedException([]);
    const userId = getUserDataByToken.userId;
    const getLastActiveDate = await this.getLastActiveDate(refreshToken);
    const getUserSession =
      await this.devicesRepository.findOneByDeviceIdUserIdAndLastActiveDate(
        userId,
        getUserDataByToken.deviceId,
        getLastActiveDate,
      );
    if (!getUserSession) throw new UnauthorizedException([]);
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
  async getLastActiveDate(refreshToken: string): Promise<string> {
    const payload: any = await this.jwtService.decode(refreshToken);
    return new Date(payload.iat * 1000).toISOString();
  } // 1
  async deleteAllDevices(refreshToken: string): Promise<DeleteResult> {
    // const findUserInBlackList =
    //   await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    // if (findUserInBlackList) throw new UnauthorizedException([]);
    const getUserDataByToken = await this.tokenVerify(refreshToken);
    if (!getUserDataByToken) throw new UnauthorizedException([]);
    const userId = getUserDataByToken.userId;
    const deviceId = getUserDataByToken.deviceId;
    //
    const getLastActiveDate = await this.getLastActiveDate(refreshToken);
    const getUserSession =
      await this.devicesRepository.findOneByDeviceIdUserIdAndLastActiveDate(
        userId,
        getUserDataByToken.deviceId,
        getLastActiveDate,
      );
    //
    if (!getUserSession) throw new UnauthorizedException([]);
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
    //
    const getLastActiveDate = await this.getLastActiveDate(refreshToken);
    const getUserSession =
      await this.devicesRepository.findOneByDeviceIdUserIdAndLastActiveDate(
        findDeviceByDeviceId.userId,
        getUserDataByToken.deviceId,
        getLastActiveDate,
      );
    //
    if (!getUserSession) throw new UnauthorizedException([]);
    return this.devicesRepository.deleteUserSessionByUserAndDeviceId(
      getUserDataByToken.userId,
      deviceId,
    );
  }
}
