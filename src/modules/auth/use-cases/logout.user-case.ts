import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../service/auth.service';
import { DevicesRepository } from '../../devices/repository/devices.repository';

@Injectable()
export class LogoutCommand {
  constructor(readonly refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase {
  constructor(
    public authService: AuthService,
    public devicesRepository: DevicesRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<boolean> {
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
        lastActiveDate,
      );
    if (!isDeviceActive)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return this.devicesRepository.deleteSessionByUserId(
      actualToken.deviceId,
      actualToken.userId,
    );
  }
}
