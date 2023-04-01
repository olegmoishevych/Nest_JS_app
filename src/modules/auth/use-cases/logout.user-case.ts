import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../service/auth.service';
import { DevicesRepository } from '../../devices/repository/devices.repository';
import { DevicesSQLRepository } from '../../devices/repository/devicesSQL.repository';
import { DeleteResult } from 'typeorm';

@Injectable()
export class LogoutCommand {
  constructor(readonly refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    public authService: AuthService,
    public devicesRepository: DevicesSQLRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<DeleteResult> {
    if (!command.refreshToken)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const lastActiveDate = this.authService.getLastActiveDateFromRefreshToken(
      command.refreshToken,
    );
    if (!lastActiveDate)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const actualToken = await this.authService.tokenVerify(
      command.refreshToken,
    );
    if (!actualToken)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const isDeviceActive =
      await this.devicesRepository.findDeviceByUserIdDeviceIdAndLastActiveDate(
        actualToken.userId,
        actualToken.deviceId,
        new Date(actualToken.iat * 1000).toISOString(),
      );
    if (!isDeviceActive)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.devicesRepository.deleteSessionByDeviceId(actualToken.deviceId);
  }
}
