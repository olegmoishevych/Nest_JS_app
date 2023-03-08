import {
  BadRequestException,
  ForbiddenException,
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
import { JwtRepository } from '../repository/jwt.repository';
import jwt from 'jsonwebtoken';
import {
  JwtTokenPairViewModel,
  TokensVerifyViewModal,
  TokensViewModel,
} from '../schemas/tokens.schemas';
import { IpDto } from '../dto/api.dto';
import { RecoveryCodeModal } from '../schemas/recoveryCode.schemas';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../email/email.service';
import * as bcrypt from 'bcrypt';
import { DevicesService } from '../../devices/service/devices.service';

@Injectable()
export class AuthService {
  constructor(
    public usersService: UsersService,
    public emailService: EmailService,
    public jwtService: JwtService,
    public usersRepository: UsersRepository,
    public jwtRepository: JwtRepository,
    public deviceService: DevicesService,
  ) {}

  async userRegistration(registrationDto: AuthDto): Promise<UserModel> {
    return this.usersService.createUser(registrationDto);
  }

  async userRegistrationConfirmation(code: string): Promise<UserModel> {
    const findUserByCode = await this.usersRepository.findUserByCode(code);
    if (!findUserByCode)
      throw new BadRequestException([
        { message: 'code not found', field: 'code' },
      ]);
    if (findUserByCode.emailConfirmation.isConfirmed)
      throw new BadRequestException([
        {
          message: 'user isConfirmed',
          field: 'code',
        },
      ]);
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
      ip,
    );
    const lastActiveDate = await this.getLastActiveDate(createJwt.refreshToken);
    try {
      await this.deviceService.createUserSession(
        ip,
        title,
        lastActiveDate,
        deviceId,
        findUserByLoginOrEmail.id,
      );
      return createJwt;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getLastActiveDate(refreshToken: string): Promise<string> {
    const payload: any = await this.jwtService.decode(refreshToken);
    return new Date(payload.iat * 1000).toISOString();
  }
  async logout(refreshToken: string): Promise<TokensViewModel> {
    const findRefreshTokenInBlackList =
      await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    if (findRefreshTokenInBlackList)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const tokenVerify = await this.tokenVerify(refreshToken);
    if (!tokenVerify)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    try {
      await this.deviceService.deleteSessionByUserId(
        tokenVerify.userId,
        tokenVerify.deviceId,
      );
      return this.jwtRepository.addRefreshTokenInBlackList(refreshToken);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async refreshToken(
    refreshToken: string,
    ip: IpDto,
  ): Promise<JwtTokenPairViewModel> {
    const findRefreshTokenInBlackList =
      await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    if (findRefreshTokenInBlackList)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const tokenVerify = await this.tokenVerify(refreshToken);
    if (!tokenVerify)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const createJwtTokenPair = await this.createJwtPair(
      tokenVerify.userId,
      ip.title,
      ip.ip,
      tokenVerify.deviceId,
    );
    const lastActiveDate = await this.getLastActiveDate(
      createJwtTokenPair.refreshToken,
    );

    try {
      await this.deviceService.updateUserSession(
        ip.ip,
        ip.title,
        // lastActiveDate,
        new Date(),
        tokenVerify.deviceId,
        tokenVerify.userId,
      );
      await this.jwtRepository.addRefreshTokenInBlackList(refreshToken);
      return createJwtTokenPair;
    } catch (e) {
      return null;
    }
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
    ip: string,
  ): Promise<JwtPairType> {
    const payload = { userId: userId, deviceId: deviceId };
    const jwtPair: JwtPairType = {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '10s',
        secret: JWT.jwt_secret,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '20s',
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
