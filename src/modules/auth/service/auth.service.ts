import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthDto, LoginOrEmailDto, NewPasswordDto } from '../dto/auth.dto';
import { UserModel } from '../../users/schemas/users.schema';
import { UsersService } from '../../users/service/users.service';
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
import { EmailService } from '../../email/email.service';
import * as bcrypt from 'bcrypt';
import { DevicesService } from '../../devices/service/devices.service';
import { DevicesRepository } from '../../devices/repository/devices.repository';
import { DevicesModal } from '../../devices/schemas/devices.schemas';

@Injectable()
export class AuthService {
  constructor(
    public usersService: UsersService,
    public emailService: EmailService,
    public jwtService: JwtService,
    public usersRepository: UsersRepository,
    public deviceService: DevicesService,
    public deviceRepository: DevicesRepository,
  ) {}

  async userRegistration(registrationDto: AuthDto): Promise<UserModel> {
    return this.usersService.createUser(registrationDto);
  }

  async userRegistrationConfirmation(code: string): Promise<UserModel> {
    const findUserByCode = await this.usersRepository.findUserByCode(code);
    if (!findUserByCode) throw new BadRequestException([]);
    if (findUserByCode.emailConfirmation.isConfirmed)
      throw new BadRequestException([]);
    return this.usersRepository.updateConfirmationCode(findUserByCode);
  }

  async userRegistrationEmailResending(email: string): Promise<boolean> {
    const findUserByEmail = await this.usersRepository.findUserByEmail(email);
    if (!findUserByEmail || findUserByEmail.emailConfirmation.isConfirmed)
      throw new BadRequestException([
        {
          message: 'Email',
          field: 'email',
        },
      ]);
    return this.usersService.updateUserByEmailResending(email, findUserByEmail);
  }

  async login(
    loginOrEmail: LoginOrEmailDto,
    ip: string,
    title: string,
  ): Promise<JwtPairType> {
    const findUserByLoginOrEmail = await this.usersService.checkUserCredentials(
      loginOrEmail,
    );
    const deviceId = new ObjectId().toString();
    const createJwt = await this.createJwtPair(
      findUserByLoginOrEmail.id,
      title,
      deviceId,
    );
    const lastActiveDate = this.getLastActiveDateFromRefreshToken(
      createJwt.refreshToken,
    );
    await this.deviceService.createUserSession(
      ip,
      title,
      lastActiveDate,
      deviceId,
      findUserByLoginOrEmail.id,
    );
    return createJwt;
  }

  async logout(refreshToken: string): Promise<boolean> {
    const lastActiveDate = this.getLastActiveDateFromRefreshToken(refreshToken);
    if (!lastActiveDate)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const tokenVerify = await this.tokenVerify(refreshToken);
    if (!tokenVerify)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.deviceService.deleteSessionByUserId(
      tokenVerify.userId,
      tokenVerify.deviceId,
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
      ip.title,
      tokenVerify.deviceId,
    );
    const lastActiveDate = this.getLastActiveDateFromRefreshToken(
      createJwtTokenPair.refreshToken,
    );
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

  async createJwtPair(
    userId: string,
    title: string,
    deviceId: string,
  ): Promise<JwtPairType> {
    const payload = { userId: userId, deviceId: deviceId };
    const jwtPair: JwtPairType = {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '1000s',
        secret: JWT.jwt_secret,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '2000s',
        secret: JWT.jwt_secret,
      }),
    };
    return jwtPair;
  }

  async passwordRecovery(email: string): Promise<RecoveryCodeModal> {
    const findUserByEmail = await this.usersRepository.findUserByEmail(email);
    if (!findUserByEmail)
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
      await this.emailService.sentEmail(email, 'recovery code', message);
    } catch (error) {
      console.log(error);
      return null;
    }
    return addRecoveryCodeInList;
  }

  async findUserByRecoveryCodeAndChangeNewPassword(
    newPassword: NewPasswordDto,
  ): Promise<UserModel> {
    const findUserByRecoveryCode =
      await this.usersRepository.findRecoveryUserCode(newPassword.recoveryCode);
    if (!findUserByRecoveryCode)
      throw new NotFoundException([
        {
          message: 'RecoveryCode not found',
          field: 'recoveryCode',
        },
      ]);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword.newPassword, salt);
    return this.usersRepository.updateUserHash(
      findUserByRecoveryCode.email,
      hash,
    );
  }
}
