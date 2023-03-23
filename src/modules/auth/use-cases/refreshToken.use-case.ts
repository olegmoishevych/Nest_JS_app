import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
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
export class RefreshTokenUseCase {
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
      command.ipDto.title,
      tokenVerify.deviceId,
    );
    const lastActiveDate = this.authService.getLastActiveDateFromRefreshToken(
      command.refreshToken,
    );
    if (!lastActiveDate) throw new UnauthorizedException([]);
    const newSession = new DevicesEntity();
    newSession.updateUserSessionById(
      command.ipDto.ip,
      command.ipDto.title,
      lastActiveDate,
      tokenVerify.deviceId,
      tokenVerify.userId,
    );
    await this.devicesRepository.saveResult(newSession);
    return tokensPair;
  }
}
