import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../domain/entities/user.entity';
import { AuthService } from '../service/auth.service';
import { DevicesService } from '../../devices/service/devices.service';
import { DevicesSQLRepository } from '../../devices/repository/devicesSQL.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class LoginCommand {
  constructor(
    readonly ip: string,
    readonly title: string,
    readonly user: UserEntity,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private authService: AuthService,
    private deviceService: DevicesService,
    private devicesRepo: DevicesSQLRepository,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { user, title, ip } = command;
    const deviceId = randomUUID();
    const jwtTokens = await this.authService.createJwtPair(user.id, deviceId);
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
