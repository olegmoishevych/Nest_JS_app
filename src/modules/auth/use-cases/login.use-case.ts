import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../domain/entities/user.entity';
import { ObjectId } from 'mongodb';
import { AuthService } from '../service/auth.service';
import { DevicesService } from '../../devices/service/devices.service';
import { DevicesSQLRepository } from '../../devices/repository/devicesSQL.repository';

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
    private devicesRepo: DevicesSQLRepository,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { user, title, ip } = command;
    const deviceId = new ObjectId().toString();
    const jwtTokens = await this.authService.createJwtPair(
      user.id,
      title,
      deviceId,
    );
    const lastActiveDate = this.authService.getLastActiveDateFromRefreshToken(
      jwtTokens.refreshToken,
    );
    await this.devicesRepo.createUserSession(
      ip,
      title,
      lastActiveDate,
      deviceId,
      user.id,
    );
    return jwtTokens;
  }
}
