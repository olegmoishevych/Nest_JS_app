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
import { TokensViewModel } from '../schemas/tokens.schemas';

@Injectable()
export class AuthService {
  constructor(
    public usersService: UsersService,
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

  async tokenVerify(token: string): Promise<string> {
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
    const payload = { userId, deviceId };
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
}
