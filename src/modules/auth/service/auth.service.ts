import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NewPasswordDto } from '../dto/auth.dto';
import { UserModel } from '../../users/schemas/users.schema';
import { UsersRepository } from '../../users/repository/users.repository';
import { JwtService } from '@nestjs/jwt';
import { JWT, JwtPairType } from '../constants';
import jwt from 'jsonwebtoken';
import {
  JwtTokenPairViewModel,
  TokensVerifyViewModal,
} from '../schemas/tokens.schemas';
import { IpDto } from '../dto/api.dto';
import { RecoveryCodeModal } from '../schemas/recoveryCode.schemas';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { DevicesService } from '../../devices/service/devices.service';
import { DevicesRepository } from '../../devices/repository/devices.repository';
import { DevicesModal } from '../../devices/schemas/devices.schemas';

@Injectable()
export class AuthService {
  constructor(
    public jwtService: JwtService,
    public usersRepository: UsersRepository,
    public deviceService: DevicesService,
    public deviceRepository: DevicesRepository,
  ) {}

  async logout(refreshToken: string): Promise<boolean> {
    if (!refreshToken)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const lastActiveDate = this.getLastActiveDateFromRefreshToken(refreshToken);
    if (!lastActiveDate)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const topicalToken = await this.tokenVerify(refreshToken);
    if (!topicalToken)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const isDeviceActive =
      await this.deviceRepository.findDeviceByUserIdDeviceIdAndLastActiveDate(
        topicalToken.userId,
        topicalToken.deviceId,
        new Date(topicalToken.iat * 1000).toISOString(),
      );
    if (!isDeviceActive)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.deviceService.deleteSessionByUserId(
      topicalToken.userId,
      topicalToken.deviceId,
    );
  }

  async refreshToken(
    refreshToken: string,
    ip: IpDto,
  ): Promise<JwtTokenPairViewModel> {
    const tokenVerify = await this.tokenVerify(refreshToken);
    if (!tokenVerify)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const isDeviceActive =
      await this.deviceRepository.findDeviceByUserIdDeviceIdAndLastActiveDate(
        tokenVerify.userId,
        tokenVerify.deviceId,
        new Date(tokenVerify.iat * 1000).toISOString(),
      );
    if (!isDeviceActive)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const createJwtTokenPair = await this.createJwtPair(
      tokenVerify.userId,
      tokenVerify.deviceId,
    );
    const lastActiveDate = this.getLastActiveDateFromRefreshToken(
      createJwtTokenPair.refreshToken,
    );
    if (!lastActiveDate) throw new UnauthorizedException([]);
    const newSession = new DevicesModal(
      ip.ip,
      ip.title,
      lastActiveDate,
      tokenVerify.deviceId,
      tokenVerify.userId,
    );
    await this.deviceRepository.updateUserSessionById(newSession);
    return createJwtTokenPair;
  }

  getLastActiveDateFromRefreshToken(refreshToken: string): string {
    const payload: any = jwt.decode(refreshToken);
    return new Date(payload.iat * 1000).toISOString();
  }

  async tokenVerify(token: string): Promise<TokensVerifyViewModal> {
    try {
      const result: any = jwt.verify(token, JWT.jwt_secret);
      return result;
    } catch (error) {
      return null;
    }
  }

  async createJwtPair(userId: string, deviceId: string): Promise<JwtPairType> {
    const payload = { userId: userId, deviceId: deviceId };
    const jwtPair: JwtPairType = {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '5m',
        secret: JWT.jwt_secret,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '10m',
        secret: JWT.jwt_secret,
      }),
    };
    return jwtPair;
  }

  // async generateTokens(userId: string, deviceId?: string) {
  //   const accessToken = this.jwtService.sign({ userId });
  //   const refreshToken = this.jwtService.sign(
  //     { userId, deviceId: deviceId || randomUUID() },
  //     { expiresIn: '20s' },
  //   );
  //   return { accessToken, refreshToken };
  // }

  async passwordRecovery(email: string): Promise<RecoveryCodeModal> {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user)
      throw new NotFoundException([
        {
          message: 'user not found',
          field: 'email',
        },
      ]);
    const recoveryCode: RecoveryCodeModal = {
      email: email,
      recoveryCode: uuidv4(),
    };
    const addRecoveryCodeInList =
      await this.usersRepository.addRecoveryUserCode(recoveryCode);
    try {
      const message = `https://somesite.com/password-recovery?recoveryCode=${recoveryCode.recoveryCode}`;
      // await this.emailService.sentEmail(email, 'recovery code', message);
    } catch (error) {
      console.log(error);
      return null;
    }
    return addRecoveryCodeInList;
  }

  async findUserByRecoveryCodeAndChangeNewPassword(
    newPassword: NewPasswordDto,
  ): Promise<UserModel> {
    const user = await this.usersRepository.findRecoveryUserCode(
      newPassword.recoveryCode,
    );
    if (!user)
      throw new NotFoundException([
        {
          message: 'RecoveryCode not found',
          field: 'recoveryCode',
        },
      ]);
    // const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword.newPassword, 10);
    return this.usersRepository.updateUserHash(user.email, hash);
  }
}
