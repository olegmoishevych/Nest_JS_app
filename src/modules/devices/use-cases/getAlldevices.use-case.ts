import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { AuthService } from '../../auth/service/auth.service';
import { DevicesSQLRepository } from '../repository/devicesSQL.repository';
import { DevicesEntity } from '../domain/entities/devices.entity';

@Injectable()
export class GetAlldevicesCommand {
  constructor(readonly refreshToken: string) {}
}

@CommandHandler(GetAlldevicesCommand)
export class GetAlldevicesUseCase implements ICommand {
  constructor(
    public authService: AuthService,
    public devicesRepo: DevicesSQLRepository,
  ) {}

  async execute(command: GetAlldevicesCommand): Promise<DevicesEntity[]> {
    if (!command.refreshToken) throw new UnauthorizedException([]);
    const user = await this.authService.tokenVerify(command.refreshToken);
    if (!user) throw new UnauthorizedException([]);
    const userId = user.userId;
    return this.devicesRepo.findAllUserDevicesByUserId(userId);
  }
}
