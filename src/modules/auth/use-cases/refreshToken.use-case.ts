import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../service/auth.service';
import { DevicesRepository } from '../../devices/repository/devices.repository';
import { IpDto } from '../dto/api.dto';
import { DevicesModal } from '../../devices/schemas/devices.schemas';
import { DevicesEntity } from '../../devices/domain/entities/devices.entity';
import { DevicesSQLRepository } from '../../devices/repository/devicesSQL.repository';

@Injectable()
export class RefreshTokenCommand {
  constructor(readonly ipDto: IpDto, readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler {
  constructor(
    public authService: AuthService,
    public devicesRepository: DevicesSQLRepository,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenVerify = await this.authService.tokenVerify(
      command.refreshToken,
    );
    if (!tokenVerify)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const isActiveDevice =
      await this.devicesRepository.findDeviceByUserIdDeviceIdAndLastActiveDate(
        tokenVerify.userId,
        tokenVerify.deviceId,
        new Date(tokenVerify.iat * 1000).toISOString(),
      );
    if (!isActiveDevice)
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const tokensPair = await this.authService.createJwtPair(
      tokenVerify.userId,
      tokenVerify.deviceId,
    );
    const lastActiveDate = this.authService.getLastActiveDateFromRefreshToken(
      command.refreshToken,
    );
    if (!lastActiveDate) throw new UnauthorizedException([]);
    const deviceSession = await this.devicesRepository.findDeviceByDeviceId(
      tokenVerify.deviceId,
    );
    deviceSession.ip = command.ipDto.ip;
    deviceSession.title = command.ipDto.title;
    deviceSession.lastActiveDate = lastActiveDate;
    await this.devicesRepository.saveResult(deviceSession);
    return tokensPair;
  }
}
