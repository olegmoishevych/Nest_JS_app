import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommand } from '@nestjs/cqrs';
import { AuthService } from '../../auth/service/auth.service';
import { DeleteResult } from 'typeorm';
import { DevicesSQLRepository } from '../repository/devicesSQL.repository';

@Injectable()
export class DeleteAlldevicesCommand {
  constructor(readonly refreshToken: string) {}
}
@CommandHandler(DeleteAlldevicesCommand)
export class DeleteAlldevicesUseCase implements ICommand {
  constructor(
    public authService: AuthService,
    public devicesRepo: DevicesSQLRepository,
  ) {}
  async execute(command: DeleteAlldevicesCommand): Promise<DeleteResult> {
    if (!command.refreshToken) throw new UnauthorizedException([]);
    const lastActive = this.authService.getLastActiveDateFromRefreshToken(
      command.refreshToken,
    );
    if (!lastActive) throw new UnauthorizedException([]);
    const user = await this.authService.tokenVerify(command.refreshToken);
    if (!user) throw new UnauthorizedException([]);
    const { userId, deviceId } = user;
    return this.devicesRepo.deleteAllDevicesById(userId, deviceId);
  }
}
