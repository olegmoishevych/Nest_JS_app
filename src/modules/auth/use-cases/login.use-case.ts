import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../domain/entities/user.entity';
import { ObjectId } from 'mongodb';
import { AuthService } from '../service/auth.service';
import { DevicesService } from '../../devices/service/devices.service';

@Injectable()
export class LoginCommand {
  constructor(
    readonly ip: string,
    readonly title: string,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase {
  constructor(
    private authService: AuthService,
    private deviceService: DevicesService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { user, title, ip } = command;
    if (user.banInfo.isBanned)
      throw new UnauthorizedException(['User is banned']);
    const deviceId = new ObjectId().toString();
    const jwtTokens = await this.authService.createJwtPair(
      user.id,
      title,
      deviceId,
    );
    const lastActiveDate = this.authService.getLastActiveDateFromRefreshToken(
      jwtTokens.refreshToken,
    );
    await this.deviceService.createUserSession(
      ip,
      title,
      lastActiveDate,
      deviceId,
      user.id,
    );
    return jwtTokens;
  }
}
