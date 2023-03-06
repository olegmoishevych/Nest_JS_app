import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { AuthDto, LoginOrEmailDto } from '../dto/auth.dto';
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

@Injectable()
export class AuthService {
  constructor(
    public usersService: UsersService,
    public emailService: EmailService,
    public jwtService: JwtService,
    public usersRepository: UsersRepository,
    public jwtRepository: JwtRepository,
  ) {}

  async userRegistration(registrationDto: AuthDto): Promise<UserModel> {
    return this.usersService.createUser(registrationDto);
  }

  async userRegistrationConfirmation(code: string): Promise<UserModel> {
    const findUserByCode = await this.usersRepository.findUserByCode(code);
    if (!findUserByCode)
      throw new NotFoundException([
        {
          message: 'User not found',
          field: 'user',
        },
      ]);
    if (findUserByCode.emailConfirmation.isConfirmed)
      throw new NotFoundException([
        {
          message: 'User already confirmed',
          field: 'user',
        },
      ]);
    return this.usersRepository.updateConfirmationCode(findUserByCode);
  }

  async userRegistrationEmailResending(email: string): Promise<boolean> {
    const findUserByEmail = await this.usersRepository.findUserByEmail(email);
    if (!findUserByEmail || findUserByEmail.emailConfirmation.isConfirmed)
      throw new NotFoundException([
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
    const deviceId: string = new ObjectId().toString();
    const createJwt = await this.createJwtPair(
      findUserByLoginOrEmail.id,
      title,
      deviceId,
      ip,
    );
    return createJwt;
  }

  async logout(refreshToken: string): Promise<TokensViewModel> {
    const findRefreshTokenInBlackList =
      await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    if (findRefreshTokenInBlackList)
      throw new NotFoundException([
        {
          message: 'refresh token in black list',
          field: 'refresh token',
        },
      ]);
    const tokenVerify = await this.tokenVerify(refreshToken);
    if (!tokenVerify) throw new NotFoundException([]);
    return this.jwtRepository.addRefreshTokenInBlackList(refreshToken);
  }

  async refreshToken(
    refreshToken: string,
    ip: IpDto,
  ): Promise<JwtTokenPairViewModel> {
    const findRefreshTokenInBlackList =
      await this.jwtRepository.findRefreshTokenInBlackList(refreshToken);
    if (findRefreshTokenInBlackList)
      throw new NotFoundException([
        {
          message: 'refresh token in black list',
          field: 'refresh token',
        },
      ]);
    const tokenVerify = await this.tokenVerify(refreshToken);
    if (!tokenVerify) throw new NotFoundException([]);
    const createJwtTokenPair = await this.createJwtPair(
      tokenVerify.userId,
      ip.title,
      ip.ip,
      tokenVerify.deviceId,
    );
    try {
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
        expiresIn: '100000s',
        secret: JWT.jwt_secret,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '200000s',
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
}
